package backend;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserDAO {

    // Method to register a new user
    public static String registerUser(String username, int age, String gender, String contact, String email, String password, String userType) {
        String query = "INSERT INTO users (username, age, gender, contact, email, password, userType) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, username);
            stmt.setInt(2, age);
            stmt.setString(3, gender);
            stmt.setString(4, contact);
            stmt.setString(5, email);
            stmt.setString(6, password);
            stmt.setString(7, userType);

            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                return "{\"user\":{\"id\":0,\"username\":\"" + username + "\",\"email\":\"" + email + "\",\"userType\":\"" + userType + "\"},\"message\":\"User Registered\"}";
            } else {
                return "{\"message\":\"Registration Failed\"}";
            }

        } catch (SQLException e) {
            // Check if it's a duplicate email
            if (e.getMessage().contains("Duplicate entry")) {
                return "{\"message\":\"Email already exists\"}";
            }
            return "{\"message\":\"Database Error: " + e.getMessage().replace("\"", "\\\"") + "\"}";
        }
    }

    // Method to login a user
    public static String loginUser(String email, String password) {
        String query = "SELECT id, username, userType FROM users WHERE email = ? AND password = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, email);
            stmt.setString(2, password);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                int id = rs.getInt("id");
                String username = rs.getString("username");
                String userType = rs.getString("userType");
                // Return JSON with user details
                return "{\"user\":{\"id\":" + id + ",\"username\":\"" + username + "\",\"email\":\"" + email + "\",\"userType\":\"" + userType + "\"},\"message\":\"Login Success\"}";
            } else {
                return "{\"message\":\"Invalid Credentials\"}";
            }

        } catch (SQLException e) {
            return "{\"message\":\"Database Error: " + e.getMessage().replace("\"", "\\\"") + "\"}";
        }
    }
}