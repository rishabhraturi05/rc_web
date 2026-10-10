import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import Admin from "@/app/models/admin";
import AddSec from "@/app/models/AddSec";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      currentPassword,
      newUsername,
      newPassword,
      targetAddSecId,
      targetDepartment,
    } = body || {};

    await connectDB();

    const isSelfAdmin = session.user.role === "admin";
    const isSelfAddSec = session.user.role === "addsec";

    // CASE 1: Admin managing another AddSec account's credentials
    if ((targetAddSecId || targetDepartment) && isSelfAdmin) {
      let targetAddSec = null;
      if (targetAddSecId) {
        targetAddSec = await AddSec.findById(targetAddSecId);
      } else if (targetDepartment) {
        targetAddSec = await AddSec.findOne({
          department: { $regex: new RegExp(`^${targetDepartment}$`, "i") },
        });
      }

      if (!targetAddSec) {
        return NextResponse.json(
          { success: false, message: "Target AddSec account not found." },
          { status: 404 }
        );
      }

      // Check new username
      if (newUsername && newUsername.trim()) {
        const cleanUser = newUsername.trim().toLowerCase();
        if (cleanUser !== targetAddSec.username.toLowerCase()) {
          const existingAddSec = await AddSec.findOne({ username: cleanUser });
          const existingAdmin = await Admin.findOne({ username: cleanUser });
          if (existingAddSec || existingAdmin) {
            return NextResponse.json(
              { success: false, message: "Username is already taken by another account." },
              { status: 400 }
            );
          }
          targetAddSec.username = cleanUser;
        }
      }

      // Check new password
      if (newPassword && newPassword.trim()) {
        const cleanPass = newPassword.trim();
        if (cleanPass.length < 6) {
          return NextResponse.json(
            { success: false, message: "Password must be at least 6 characters long." },
            { status: 400 }
          );
        }
        targetAddSec.password = await bcrypt.hash(cleanPass, 10);
      }

      await targetAddSec.save();

      return NextResponse.json({
        success: true,
        message: `Credentials updated successfully for ${targetAddSec.department} AddSec (${targetAddSec.username}).`,
        username: targetAddSec.username,
      });
    }

    // CASE 2: User changing their own credentials (requires current password)
    if (!currentPassword || !String(currentPassword).trim()) {
      return NextResponse.json(
        { success: false, message: "Current password is required to verify identity." },
        { status: 400 }
      );
    }

    if ((!newUsername || !newUsername.trim()) && (!newPassword || !newPassword.trim())) {
      return NextResponse.json(
        { success: false, message: "Please provide a new User ID or a new Password." },
        { status: 400 }
      );
    }

    if (isSelfAdmin) {
      let adminRecord = null;
      if (session.user.id) {
        adminRecord = await Admin.findById(session.user.id);
      }
      if (!adminRecord && session.user.username) {
        adminRecord = await Admin.findOne({ username: session.user.username });
      }

      if (!adminRecord) {
        return NextResponse.json(
          { success: false, message: "Admin account not found in database." },
          { status: 404 }
        );
      }

      const isCurrentMatch = await bcrypt.compare(String(currentPassword).trim(), adminRecord.password);
      if (!isCurrentMatch) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect." },
          { status: 400 }
        );
      }

      // Update username if provided
      if (newUsername && newUsername.trim()) {
        const cleanUser = newUsername.trim();
        if (cleanUser !== adminRecord.username) {
          const duplicateAdmin = await Admin.findOne({ username: cleanUser });
          const duplicateAddSec = await AddSec.findOne({ username: cleanUser.toLowerCase() });
          if (duplicateAdmin || duplicateAddSec) {
            return NextResponse.json(
              { success: false, message: "This User ID / username is already in use." },
              { status: 400 }
            );
          }
          adminRecord.username = cleanUser;
        }
      }

      // Update password if provided
      if (newPassword && newPassword.trim()) {
        const cleanPass = newPassword.trim();
        if (cleanPass.length < 6) {
          return NextResponse.json(
            { success: false, message: "New password must be at least 6 characters long." },
            { status: 400 }
          );
        }
        adminRecord.password = await bcrypt.hash(cleanPass, 10);
      }

      await adminRecord.save();

      return NextResponse.json({
        success: true,
        message: "Admin credentials updated successfully! Please re-login with your new credentials.",
        username: adminRecord.username,
      });
    }

    if (isSelfAddSec) {
      let addSecRecord = null;
      if (session.user.id) {
        addSecRecord = await AddSec.findById(session.user.id);
      }
      if (!addSecRecord && session.user.username) {
        addSecRecord = await AddSec.findOne({ username: session.user.username.toLowerCase() });
      }

      if (!addSecRecord) {
        return NextResponse.json(
          { success: false, message: "AddSec account not found in database." },
          { status: 404 }
        );
      }

      const isCurrentMatch = await bcrypt.compare(String(currentPassword).trim(), addSecRecord.password);
      if (!isCurrentMatch) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect." },
          { status: 400 }
        );
      }

      // Update username if provided
      if (newUsername && newUsername.trim()) {
        const cleanUser = newUsername.trim().toLowerCase();
        if (cleanUser !== addSecRecord.username) {
          const duplicateAddSec = await AddSec.findOne({ username: cleanUser });
          const duplicateAdmin = await Admin.findOne({ username: cleanUser });
          if (duplicateAddSec || duplicateAdmin) {
            return NextResponse.json(
              { success: false, message: "This User ID / username is already taken." },
              { status: 400 }
            );
          }
          addSecRecord.username = cleanUser;
        }
      }

      // Update password if provided
      if (newPassword && newPassword.trim()) {
        const cleanPass = newPassword.trim();
        if (cleanPass.length < 6) {
          return NextResponse.json(
            { success: false, message: "New password must be at least 6 characters long." },
            { status: 400 }
          );
        }
        addSecRecord.password = await bcrypt.hash(cleanPass, 10);
      }

      await addSecRecord.save();

      return NextResponse.json({
        success: true,
        message: "AddSec credentials updated successfully! Please re-login with your new credentials.",
        username: addSecRecord.username,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid role for credential update." },
      { status: 403 }
    );
  } catch (error) {
    console.error("Change credentials error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update credentials." },
      { status: 500 }
    );
  }
}
