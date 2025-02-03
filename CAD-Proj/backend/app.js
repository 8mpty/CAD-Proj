const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
  SNSClient,
  CreateTopicCommand,
  SubscribeCommand,
  PublishCommand,
} = require("@aws-sdk/client-sns");
const {
  RekognitionClient,
  DetectLabelsCommand,
} = require("@aws-sdk/client-rekognition");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const upload = multer({
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

const getAwsClient = async (ClientClass) => {
  try {
    // Try to get credentials from default provider
    const credentials = await defaultProvider()();
    
    return new ClientClass({
      region: process.env.AWS_REGION || "us-east-1",
      credentials
    });
  } catch (error) {
    console.log("Failed to get defaultCredentials, using .env instead");
    
    return new ClientClass({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
      }
    });
  }
};


let s3Client, snsClient, rekognitionClient;

const requireAwsClients = (req, res, next) => {
  if (!s3Client || !snsClient || !rekognitionClient) {
    return res.status(503).json({ error: "AWS services not initialized yet" });
  }
  next();
};

const initialize = async () => {
  try {
    // Initialize AWS clients
    const clients = await initializeAwsClients();
    ({ s3Client, snsClient, rekognitionClient } = clients);
    console.log("AWS clients initialized successfully");

    // Initialize database pool (your existing database initialization code here)
    await initializeDatabase()
      .then((appPool) => {
        pool = appPool;
        console.log("Database connection pool established");
      })
      .catch((error) => {
        console.error("Failed to initialize database:", error);
        throw error;  // Re-throw to be caught by outer try-catch
      });

    // Only start the server after everything is initialized
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize services:", error);
    process.exit(1);
  }
};

const initializeAwsClients = async () => {
  const s3Client = await getAwsClient(S3Client);
  const snsClient = await getAwsClient(SNSClient);
  const rekognitionClient = await getAwsClient(RekognitionClient);
  
  return { s3Client, snsClient, rekognitionClient };
};

const categoryTopics = {};

const analyzeImage = async (imageBuffer) => {
  try {
    const command = new DetectLabelsCommand({
      Image: {
        Bytes: imageBuffer,
      },
      MaxLabels: 10,
      MinConfidence: 70,
    });

    const response = await rekognitionClient.send(command);

    const labels = response.Labels.map((label) => ({
      name: label.Name,
      confidence: label.Confidence.toFixed(2),
    }));

    const suggestedCategory = getSuggestedCategory(labels);

    return {
      labels,
      suggestedCategory,
    };
  } catch (error) {
    console.error("Rekognition error:", error);
    return {
      labels: [],
      suggestedCategory: null,
    };
  }
};

const getSuggestedCategory = (labels) => {
  const categoryKeywords = {
    Electronics: [
      "Electronic",
      "Phone",
      "Computer",
      "Laptop",
      "Tablet",
      "Camera",
      "Device",
    ],
    Jewelry: ["Jewelry", "Ring", "Necklace", "Watch", "Accessory", "Bracelet"],
    Clothing: [
      "Clothing",
      "Apparel",
      "Shirt",
      "Pants",
      "Jacket",
      "Shoe",
      "Hat",
    ],
    Documents: ["Document", "Paper", "Book", "Card", "ID"],
    Keys: ["Key", "Lock", "Metal Object"],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (
      labels.some((label) =>
        keywords.some((keyword) =>
          label.name.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    ) {
      return category;
    }
  }

  return "Other";
};

async function getTopicArn(category) {
  if (categoryTopics[category]) {
    return categoryTopics[category];
  }

  try {
    const createTopicCommand = new CreateTopicCommand({
      Name: `lost-and-found-${category.toLowerCase().replace(/\s+/g, "-")}`,
    });

    const response = await snsClient.send(createTopicCommand);
    categoryTopics[category] = response.TopicArn;
    return response.TopicArn;
  } catch (error) {
    console.error("Error creating SNS topic:", error);
    throw error;
  }
}

const initializeDatabase = async () => {
  const initPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: "postgres",
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const dbResult = await initPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      ["lostandfound"]
    );

    if (dbResult.rows.length === 0) {
      await initPool.query("CREATE DATABASE lostandfound");
      console.log("Database created successfully");
    }

    await initPool.end();

    const appPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: "lostandfound",
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // try{
    //   await appPool.query(`
    //     DROP TABLE IF EXISTS items;
    //   `);  
    //   console.log("DROP ITEMS SUCC!!");
    // } catch(error){
    //   console.error(error);
    // }


    await appPool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        date_found DATE NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        category VARCHAR(100) NOT NULL,
        ai_labels JSONB,
        claimed_status BOOLEAN DEFAULT FALSE,
        claimed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await appPool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        topic_arn VARCHAR(255) NOT NULL,
        subscription_arn VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email, category)
      );
    `);

    console.log("Tables initialized successfully");
    return appPool;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
};

let pool; // This will hold the database connection pool

initializeDatabase()
  .then((appPool) => {
    pool = appPool;
    console.log("Database connection pool established");
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });

const uploadToS3 = async (file) => {
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      Metadata: {
        "Content-Type": file.mimetype,
      },
    });

    await s3Client.send(command);
    console.log("Successfully uploaded to S3");

    const imageUrl = `https://s3.${
      process.env.AWS_REGION || "us-east-1"
    }.amazonaws.com/${process.env.S3_BUCKET_NAME}/${filename}`;
    console.log("Generated image URL:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error(`Failed to upload image to S3: ${error.message}`);
  }
};

app.post("/api/subscribe", requireAwsClients, async (req, res) => {
  try {
    const { email, category } = req.body;

    const topicArn = await getTopicArn(category);
    const existingSubscription = await pool.query(
      "SELECT * FROM subscriptions WHERE email = $1 AND category = $2",
      [email, category]
    );

    if (existingSubscription.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Already subscribed to this category" });
    }

    const subscribeCommand = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: "email",
      Endpoint: email,
    });

    const subscription = await snsClient.send(subscribeCommand);

    // Store subscription in database
    await pool.query(
      "INSERT INTO subscriptions (email, category, topic_arn, subscription_arn) VALUES ($1, $2, $3, $4)",
      [email, category, topicArn, subscription.SubscriptionArn]
    );

    res.status(201).json({
      message:
        "Subscription pending. Please confirm the subscription in your email.",
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/subscriptions/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      "SELECT category FROM subscriptions WHERE email = $1",
      [email]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: error.message });
  }
});

const notifySubscribers = async (category, itemDetails) => {
  try {
    const topicArn = await getTopicArn(category);

    const message = {
      subject: `New Lost Item Found: ${itemDetails.name}`,
      message: `
        A new item has been found that matches your notification preferences:
        
        Item: ${itemDetails.name}
        Category: ${category}
        Location: ${itemDetails.location}
        Date Found: ${itemDetails.date_found}
        Description: ${itemDetails.description || "No description provided"}
        
        Please visit our website to view more details about this item.
      `,
    };

    const publishCommand = new PublishCommand({
      TopicArn: topicArn,
      Subject: message.subject,
      Message: message.message,
    });

    await snsClient.send(publishCommand);
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
};

app.post("/api/items", requireAwsClients, upload.single("image"), async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Database connection not ready" });
  }

  try {
    const { name, location, dateFound, description, category, aiLabels } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    let parsedAiLabels;
    try {
      parsedAiLabels = typeof aiLabels === 'string' ? JSON.parse(aiLabels) : aiLabels;
    } catch (error) {
      console.error('Error parsing AI labels:', error);
      parsedAiLabels = null;
    }

    const imageUrl = await uploadToS3(req.file);

    const result = await pool.query(
      "INSERT INTO items (name, location, date_found, description, image_url, category, ai_labels) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        name,
        location,
        dateFound,
        description,
        imageUrl,
        category,
        parsedAiLabels ? JSON.stringify(parsedAiLabels) : null
      ]
    );

    await notifySubscribers(category, result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-image', requireAwsClients, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image is required' });
  }
  try {
    const aiAnalysis = await analyzeImage(req.file.buffer);
    res.json(aiAnalysis);
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/items/:id/claim", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Database connection not ready" });
  }

  try {
    const { id } = req.params;
    const checkResult = await pool.query(
      "SELECT claimed_status FROM items WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (checkResult.rows[0].claimed_status) {
      return res.status(400).json({ error: "Item already claimed" });
    }

    const result = await pool.query(
      "UPDATE items SET claimed_status = TRUE, claimed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error claiming item:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/items", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Database connection not ready" });
  }

  try {
    const { search } = req.query;
    let query = "SELECT * FROM items";
    const params = [];

    if (search) {
      query += ` WHERE 
        LOWER(name) LIKE LOWER($1) OR 
        LOWER(category) LIKE LOWER($1) OR 
        LOWER(location) LIKE LOWER($1)`;
      params.push(`%${search}%`);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: error.message });
  }
});

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

initialize()