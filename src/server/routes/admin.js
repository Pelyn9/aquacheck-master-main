// backend/src/server/admin.js
import { supabaseAdmin } from "../supabaseAdminClient.js";

// Disable or enable an Auth user
export async function toggleUserStatus(userId, isActive) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: isActive ? "none" : "forever",
    });

    if (error) throw error;
    console.log(`✅ User ${userId} is now ${isActive ? "active" : "disabled"}`);
    return data;
  } catch (err) {
    console.error("❌ Error updating user status:", err.message);
    return null;
  }
}

// Delete an Auth user
export async function deleteUser(userId) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;
    console.log(`🗑️ User ${userId} deleted`);
    return data;
  } catch (err) {
    console.error("❌ Error deleting user:", err.message);
    return null;
  }
}
