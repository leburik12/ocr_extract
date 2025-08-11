Receipt OCR Backend with Asynchronous Processing

A high-performance backend system for extracting structured receipt data from uploaded images. This system leverages state-of-the-art OCR technology combined with a scalable, asynchronous job queue (BullMQ + Redis) to ensure rapid and reliable processing. Built with Node.js, Apollo GraphQL, Prisma ORM, and designed for extensibility and robustness.
Features
    GraphQL API supporting file uploads with Upload scalar.
    Accurate receipt parsing via OCR and custom text parsing logic.
    Background processing of OCR tasks using BullMQ and Redis queues to decouple upload latency.
    Robust file storage with automatic directory creation and type validation.
    Filterable receipt queries by date range and store name.
    PostgreSQL (or compatible DB) integration via Prisma for efficient data management.
    Modular, ES module based clean codebase with detailed error handling.

Architecture Overview
    File Upload: Client uploads receipt images via GraphQL mutation.
    Storage: Uploaded files saved securely on disk.
    Queueing: OCR processing jobs added to BullMQ queue.
    Worker: Separate worker process reads jobs, performs OCR and parsing.
    Database: Parsed receipt data saved asynchronously in the database.
    Querying: Clients query receipts with filters through GraphQL queries.

Technologies Used
Technology	Purpose
Node.js	Backend runtime
Apollo Server	GraphQL API server
Prisma ORM	Database client for PostgreSQL/MySQL/etc
BullMQ	Job queue for background processing
Redis	In-memory datastore supporting BullMQ
graphql-upload	File upload handling in GraphQL
Tesseract.js (or your OCR lib)	OCR text extraction from images
ES Modules	Modern JavaScript module system

Getting Started
Prerequisites
    Node.js v16+
    Redis server running locally or remotely
    PostgreSQL or compatible DB set up
    npm or yarn package manager
Installation

git clone git@github.com:yourusername/receipt-ocr-backend.git
cd receipt-ocr-backend
npm install

Database Migration
npx prisma migrate deploy

Running the API Server backend
npm run start

Running the Worker
Run the background job worker separately:
npm run start-worker


