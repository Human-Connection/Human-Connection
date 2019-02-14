import { v1 as neo4j } from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

let driver;

export function getDriver(options = {}) {
  const {
    uri = process.env.NEO4J_URI || "bolt://localhost:7687",
    username = process.env.NEO4J_USERNAME || "neo4j",
    password = process.env.NEO4J_PASSWORD || "neo4j"
  } = options;
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }
  return driver;
}
