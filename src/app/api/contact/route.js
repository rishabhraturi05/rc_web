import { connectDB } from "@/app/lib/db";
import Contact from "@/app/models/ContactResponse";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, queryType, otherQuery, message } = body;

    if (!name || !email || !queryType || !message || !phone) {
      return Response.json(
        { success: false, msg: "Missing fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const newContact = await Contact.create({
      name,
      email,
      phone,
      queryType,
      otherQuery,
      message,
    });

    return Response.json({ success: true, data: newContact }, { status: 201 });
  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
