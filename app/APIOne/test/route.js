// app/api/test-db/route.js
import client from "../../../utils/db"; // Import the database client

export async function GET(req) {
  try {
    // Test query: Get all data from the users table
    const result = await client.query("SELECT * FROM users;");

    // Check if the result has any rows
    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({
          message: "Database connection successful, but no users found.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return success response with the query result
    return new Response(
      JSON.stringify({
        message: "Database connection successful!",
        result: result.rows, // Returning all rows from the users table
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to connect to the database",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
