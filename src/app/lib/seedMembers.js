import Member from "@/app/models/Member";
import { allmembers } from "@/app/components/Membersarray";

const DEFAULT_ALUMNI = [
  {
    name: "Raj Kumar Darshanala",
    role: "Software Engineer (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "Currently a software engineer. Was part of club from its start to 2022.",
    img: "/alumini/KumarDarshanala.jpeg",
    linkedin: "http://linkedin.com/in/rajkumar-darshanala",
    instagram: "https://www.instagram.com/raj.kumar.darshanala",
    email: "rkdarshanala@gmail.com",
    year: "Batch 2022",
  },
  {
    name: "Shaik Abdullah",
    role: "Robotics Lead (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "Overhauled the robotics club through 2020-2023. Leads a startup robotics department.",
    img: "/alumini/ShaikAbdullah.jpg",
    linkedin: "https://www.linkedin.com/in/shaik-abdullah-6ab62219b",
    instagram: "https://www.instagram.com/milkshaik203",
    email: "abdullah.sk203@gmail.com",
    year: "Batch 2023",
  },
  {
    name: "Aaditya Prakash Kattekola",
    role: "PhD Scholar (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "PhD student in the Mostofi Lab at UC Santa Barbara.",
    img: "/alumini/Aaditya.jpeg",
    linkedin: "https://www.linkedin.com/in/kapi2910/",
    instagram: "@aham.kapi",
    email: "aadityapra2910@gmail.com",
    year: "Batch 2023",
  },
  {
    name: "VSK Kumar",
    role: "Former General Secretary (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "General Secretary from 2023-2024. Data Scientist at AT&T.",
    img: "/alumini/KaushikVempati.jpg",
    linkedin: "https://www.linkedin.com/in/kaushik-vempati/",
    instagram: "@vsk.kumar_",
    email: "kaushik.vempati@gmail.com",
    year: "Batch 2024",
  },
  {
    name: "Varun Gupta Tallam",
    role: "Former Joint Secretary (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "Former Joint secretary at RC 2023-24. Master student at TU Delft.",
    img: "/alumini/VarunTallam.jpg",
    linkedin: "https://www.linkedin.com/in/varun-tallam/",
    instagram: "https://instagram.com/varun_tallam",
    email: "varungupta.tallam@gmail.com",
    year: "Batch 2024",
  },
  {
    name: "SK Munawwar Ali",
    role: "Former Joint Secretary (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "R&D Mechanical Engineer at ideaForge. Joint Secretary for 2024 batch.",
    img: "/alumini/SKMunawwarAli.jpg",
    linkedin: "https://www.linkedin.com/in/sk-munawwar-ali",
    instagram: "https://www.instagram.com/skmunawwarali",
    email: "munawwarali2402@gmail.com",
    year: "Batch 2024",
  },
  {
    name: "Aryan Panhale",
    role: "Analyst (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "ROS enthusiast and data analyst.",
    img: "/alumini/Aryan_Rajan.jpg",
    linkedin: "https://www.linkedin.com/in/aryan-panhale-a49bb11b9",
    instagram: "",
    email: "aryanrajan24@gmail.com",
    year: "Batch 2024",
  },
  {
    name: "Kevin Amal Darren",
    role: "Former General Secretary (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "General Secretary in 2024-2025. Robot Software Engineer at Clutterbot.",
    img: "/alumini/Kevin.jpg",
    linkedin: "https://www.linkedin.com/in/kevin-amal-darren-794707209",
    instagram: "https://www.instagram.com/kiwikev23",
    email: "kad232003@gmail.com",
    year: "Batch 2025",
  },
  {
    name: "Potnuri Sri Anjali Pravallika",
    role: "Electronics Engineer (Alumna)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "Electronics Engineer with expertise in PCB design and VLSI research.",
    img: "/alumini/ANJALI.jpg",
    linkedin: "https://www.linkedin.com/in/potnuri-sri-anjali-pravallika-451979237",
    instagram: "",
    email: "potnuripravallika2504@gmail.com",
    year: "Batch 2025",
  },
  {
    name: "Sarvepalli Mahathi",
    role: "ECE Graduate (Alumna)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "ECE graduate. Analog electronics and RF/wireless communications.",
    img: "/alumini/S.Mahathi.jpg",
    linkedin: "https://in.linkedin.com/in/mahathi-sarvepalli",
    instagram: "",
    email: "s.mahathi1319@gmail.com",
    year: "Batch 2025",
  },
  {
    name: "Vattam Sai Sharanya",
    role: "Electronics Enthusiast (Alumna)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "Electronics enthusiast passionate about embedded systems and robotics.",
    img: "/alumini/SAISHARANYA.jpeg",
    linkedin: "https://www.linkedin.com/in/sai-sharanya-vattam-5b342130a",
    instagram: "https://www.instagram.com/_saisharanya_vattam_",
    email: "sharanyavattam1@gmail.com",
    year: "Batch 2025",
  },
  {
    name: "Mydam Umamaheshwar",
    role: "Data & ML Analyst (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "Business and ML analysis enthusiast in robotics.",
    img: "/alumini/UMAMAHESHWAR_MYDAM.jpg",
    linkedin: "https://www.linkedin.com/in/mydam-umamaheshwar-605726227/",
    instagram: "https://www.instagram.com/umamaheshwarchintu_20",
    email: "mu21btb0a44@student.nitw.ac.in",
    year: "Batch 2025",
  },
  {
    name: "G. Sai Sasivardhan",
    role: "Former Member (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "Former member of the Robotics Club.",
    img: "/members/gensecs/Gampa Sai Sasivardhan.jpg",
    linkedin: "https://in.linkedin.com/in/sai-sasivardhan-gampa-59559a254",
    instagram: "https://www.instagram.com/sasivardhansai",
    email: "",
    year: "Alumni",
  },
  {
    name: "Sudhakar",
    role: "Former Member (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "Former member of the Robotics Club.",
    img: "/members/gensecs/_Sudhakar_photo - Sudhakar Kumar.jpg",
    linkedin: "https://www.linkedin.com/in/sudhakar-kumar-38a9a4282/",
    instagram: "https://www.instagram.com/_sudhakar.08",
    email: "krsudhakar1103@gmail.com",
    year: "Alumni",
  },
  {
    name: "Anand A.L",
    role: "Former Member (Alumnus)",
    department: "Alumni",
    category: "alumni",
    isAlumni: true,
    bio: "Former member of the Robotics Club.",
    img: "/members/mech/Anand A L.jpg",
    linkedin: "https://www.linkedin.com/in/anand-al",
    instagram: "https://www.instagram.com/anandd_alx",
    email: "",
    year: "Alumni",
  },
];

function extractRollNumber(email) {
  if (!email) return "";
  const match = email.toLowerCase().match(/^([a-z]{2}\d{2}[a-z]{3}\d[a-z]?\d{2})@student\.nitw\.ac\.in/);
  if (match) return match[1].toUpperCase();
  return "";
}

function extractYear(email) {
  if (!email) return "";
  const match = email.toLowerCase().match(/^[a-z]{2}(\d{2})/);
  if (match) {
    const yr = parseInt(match[1], 10);
    if (yr === 22) return "4th Year (Batch 2022)";
    if (yr === 23) return "3rd Year (Batch 2023)";
    if (yr === 24) return "2nd Year (Batch 2024)";
    if (yr === 25) return "1st Year (Batch 2025)";
    if (yr === 26) return "Fresher (Batch 2026)";
    return `Batch 20${yr}`;
  }
  return "";
}

export async function removeDuplicateMembers() {
  try {
    const all = await Member.find({}).sort({ updatedAt: -1, createdAt: -1 }).lean();
    const seen = new Map();
    const toDeleteIds = [];

    for (const doc of all) {
      const normalizedName = (doc.name || "").trim().toLowerCase();
      if (!normalizedName) continue;

      if (!seen.has(normalizedName)) {
        seen.set(normalizedName, doc);
      } else {
        const kept = seen.get(normalizedName);

        const docHasScore =
          (doc.points && String(doc.points).trim() !== "") ||
          (doc.comments && String(doc.comments).trim() !== "") ||
          (Array.isArray(doc.positiveRemarks) && doc.positiveRemarks.length > 0) ||
          (Array.isArray(doc.negativeRemarks) && doc.negativeRemarks.length > 0) ||
          (doc.feedback && String(doc.feedback).trim() !== "");

        const keptHasScore =
          (kept.points && String(kept.points).trim() !== "") ||
          (kept.comments && String(kept.comments).trim() !== "") ||
          (Array.isArray(kept.positiveRemarks) && kept.positiveRemarks.length > 0) ||
          (Array.isArray(kept.negativeRemarks) && kept.negativeRemarks.length > 0) ||
          (kept.feedback && String(kept.feedback).trim() !== "");

        if (docHasScore && !keptHasScore) {
          toDeleteIds.push(kept._id);
          seen.set(normalizedName, doc);
        } else {
          toDeleteIds.push(doc._id);
        }
      }
    }

    if (toDeleteIds.length > 0) {
      await Member.deleteMany({ _id: { $in: toDeleteIds } });
      console.log(`[SeedMembers] Cleaned up ${toDeleteIds.length} duplicate member record(s) from database.`);
    }
  } catch (err) {
    console.error("[SeedMembers] Error during duplicate member removal:", err.message);
  }
}

export async function ensureDefaultMembers() {
  try {
    const existingCount = await Member.countDocuments();
    if (existingCount > 0) {
      // Maintain essential rules without overwriting admin additions, edits, or deletions
      await Member.updateMany(
        { name: { $regex: /dhanvanth/i } },
        {
          $set: {
            department: "Software",
            category: "software",
            isAlumni: false,
            isProf: false,
            phone: "7418056603",
            img: "/members/2026/DhanvanthChandrasekaran - Dhanvanth Chandrasekaran.jpg",
          },
        }
      );
      await Member.deleteMany({ name: { $regex: /eesh\s*tripathi/i } });

      // Ensure all 4 Additional Secretaries and 2 General Secretaries exist and have proper flags
      const coreMembers = [
        {
          name: "Rishabh Raturi",
          email: "rishabhraturi05@gmail.com",
          img: "/members/2026/Rishab_Raturi.jpg",
          linkedin: "https://www.linkedin.com/in/rishabh-raturi-18961626a/",
          instagram: "https://www.instagram.com/therishabhraturi/",
          department: "Software",
          role: "Additional Secretary",
          isAddlSec: true,
          isCore: true,
        },
        {
          name: "Soumilya Dwivedi",
          email: "soumilya.d@gmail.com",
          img: "/members/2026/soumilya_dwivedi.webp",
          linkedin: "https://www.linkedin.com/in/soumilya-dwivedi-93aa60321/",
          instagram: "",
          department: "Mechanical",
          role: "Additional Secretary",
          isAddlSec: true,
          isCore: true,
        },
        {
          name: "Dinesh Pichaappan",
          email: "dinesh21106@gmail.com",
          img: "/members/2026/dinesh_pichaappan.webp",
          linkedin: "https://www.linkedin.com/in/dinesh-pichaappan-a29484355",
          instagram: "https://www.instagram.com/dineshpichaappan/",
          department: "Embedded",
          role: "Additional Secretary",
          isAddlSec: true,
          isCore: true,
        },
        {
          name: "Shravya Rangu",
          email: "rs24eeb0b51@student.nitw.ac.in",
          img: "/members/2026/Shravya_Rangu.jpeg",
          linkedin: "https://www.linkedin.com/in/shravya-rangu-a02908261",
          instagram: "https://www.instagram.com/shravya__rangu",
          department: "Embedded",
          role: "Additional Secretary",
          isAddlSec: true,
          isCore: true,
        },
        {
          name: "Aryan Roy",
          email: "ar23mab0a18@student.nitw.ac.in",
          img: "/members/2026/aryan_roy.webp",
          linkedin: "https://www.linkedin.com/in/aryan-roy-jsr",
          instagram: "https://www.instagram.com/llamadrips?igsi=MXhtZHNza3QyYXUycw==",
          department: "Software",
          role: "General Secretary",
          isCore: true,
        },
        {
          name: "Mani Kumar",
          email: "manikumarmatta999@gmail.com",
          img: "/members/2026/mani_kumar.webp",
          linkedin: "https://www.linkedin.com/in/m-manikumar",
          instagram: "https://www.instagram.com/mani_kumar_004/",
          department: "Mechanical",
          role: "General Secretary",
          isCore: true,
        },
      ];

      for (const cm of coreMembers) {
        await Member.updateOne(
          { name: { $regex: new RegExp(`^${cm.name.replace(/\s+/g, "\\s*")}$`, "i") } },
          {
            $set: {
              role: cm.role,
              department: cm.department,
              isCore: cm.isCore || false,
              isAddlSec: cm.isAddlSec || false,
              ...(cm.img ? { img: cm.img } : {}),
            },
            $setOnInsert: {
              name: cm.name,
              email: cm.email,
              linkedin: cm.linkedin,
              instagram: cm.instagram,
              category: "member",
              isAlumni: false,
              isProf: false,
              rollNumber: extractRollNumber(cm.email),
              year: extractYear(cm.email) || "",
            },
          },
          { upsert: true }
        );
      }

      await removeDuplicateMembers();
      return;
    }
  } catch (err) {
    console.error("[SeedMembers] Count check error:", err.message);
  }

  const operations = [];

  // 1. Professor / Faculty Advisor
  if (Array.isArray(allmembers.facad)) {
    allmembers.facad.forEach((m) => {
      operations.push({
        updateOne: {
          filter: { name: m.name, isProf: true },
          update: {
            $setOnInsert: {
              name: m.name,
              department: "Professor",
              category: "professor",
              role: "Faculty Advisor",
              isProf: true,
              isAlumni: false,
              email: m.email || "",
              img: m.img || "",
              linkedin: m.linkedin || "",
              instagram: m.instagram || "",
              phone: "",
              rollNumber: "",
              year: "Faculty Advisor",
            },
          },
          upsert: true,
        },
      });
    });
  }

  // 2. Alumni
  DEFAULT_ALUMNI.forEach((m) => {
    operations.push({
      updateOne: {
        filter: { name: m.name, isAlumni: true },
        update: {
          $setOnInsert: {
            ...m,
            isAlumni: true,
            isProf: false,
            category: "alumni",
          },
        },
        upsert: true,
      },
    });
  });

  // 3. Core Command: Secretaries
  if (Array.isArray(allmembers.secretaries)) {
    allmembers.secretaries.forEach((m) => {
      operations.push({
        updateOne: {
          filter: { name: m.name, department: "Core Command" },
          update: {
            $setOnInsert: {
              name: m.name,
              department: "Core Command",
              category: "core",
              role: "General Secretary",
              isAlumni: false,
              isProf: false,
              email: m.email || "",
              img: m.img || "",
              linkedin: m.linkedin || "",
              instagram: m.instagram || "",
              phone: "",
              rollNumber: extractRollNumber(m.email),
              year: extractYear(m.email) || "Core",
            },
          },
          upsert: true,
        },
      });
    });
  }

  // 4. Core Command: Additional Secretaries
  if (Array.isArray(allmembers.addlSecretaries)) {
    allmembers.addlSecretaries.forEach((m) => {
      operations.push({
        updateOne: {
          filter: { name: m.name, department: "Core Command" },
          update: {
            $setOnInsert: {
              name: m.name,
              department: "Core Command",
              category: "core",
              role: "Additional Secretary",
              isAlumni: false,
              isProf: false,
              email: m.email || "",
              img: m.img || "",
              linkedin: m.linkedin || "",
              instagram: m.instagram || "",
              phone: "",
              rollNumber: extractRollNumber(m.email),
              year: extractYear(m.email) || "Core",
            },
          },
          upsert: true,
        },
      });
    });
  }

  // 5. Software Team
  if (Array.isArray(allmembers.software)) {
    allmembers.software.forEach((m) => {
      operations.push({
        updateOne: {
          filter: { name: m.name, department: "Software" },
          update: {
            $setOnInsert: {
              name: m.name,
              department: "Software",
              category: "member",
              role: "Member",
              isAlumni: false,
              isProf: false,
              email: m.email || "",
              img: m.img || "",
              linkedin: m.linkedin || "",
              instagram: m.instagram || "",
              phone: "",
              rollNumber: extractRollNumber(m.email),
              year: extractYear(m.email),
            },
          },
          upsert: true,
        },
      });
    });
  }

  // 6. Embedded Team
  if (Array.isArray(allmembers.embedded)) {
    allmembers.embedded.forEach((m) => {
      operations.push({
        updateOne: {
          filter: { name: m.name, department: "Embedded" },
          update: {
            $setOnInsert: {
              name: m.name,
              department: "Embedded",
              category: "member",
              role: "Member",
              isAlumni: false,
              isProf: false,
              email: m.email || "",
              img: m.img || "",
              linkedin: m.linkedin || "",
              instagram: m.instagram || "",
              phone: "",
              rollNumber: extractRollNumber(m.email),
              year: extractYear(m.email),
            },
          },
          upsert: true,
        },
      });
    });
  }

  // 7. Mechanical Team
  if (Array.isArray(allmembers.mechanical)) {
    allmembers.mechanical.forEach((m) => {
      operations.push({
        updateOne: {
          filter: { name: m.name, department: "Mechanical" },
          update: {
            $setOnInsert: {
              name: m.name,
              department: "Mechanical",
              category: "member",
              role: "Member",
              isAlumni: false,
              isProf: false,
              email: m.email || "",
              img: m.img || "",
              linkedin: m.linkedin || "",
              instagram: m.instagram || "",
              phone: m.name === "Dhanvanth Chandrasekaran" ? "7418056603" : "",
              rollNumber: extractRollNumber(m.email),
              year: extractYear(m.email) || "",
            },
          },
          upsert: true,
        },
      });
    });
  }

  // 8. PR Team
  if (Array.isArray(allmembers.pr)) {
    allmembers.pr.forEach((m) => {
      operations.push({
        updateOne: {
          filter: { name: m.name, department: "PR" },
          update: {
            $setOnInsert: {
              name: m.name,
              department: "PR",
              category: "member",
              role: "Member",
              isAlumni: false,
              isProf: false,
              email: m.email || "",
              img: m.img || "",
              linkedin: m.linkedin || "",
              instagram: m.instagram || "",
              phone: "",
              rollNumber: extractRollNumber(m.email),
              year: extractYear(m.email),
            },
          },
          upsert: true,
        },
      });
    });
  }

  if (operations.length > 0) {
    try {
      await Member.bulkWrite(operations, { ordered: false });
      console.log(`[SeedMembers] Upserted default members & alumni (${operations.length} candidates checked).`);
    } catch (err) {
      console.error("[SeedMembers] BulkWrite notice:", err.message);
    }
  }

  // Remove members who left the club
  try {
    const deletedEesh = await Member.deleteMany({ name: { $regex: /eesh\s*tripathi/i } });
    if (deletedEesh.deletedCount > 0) {
      console.log(`[SeedMembers] Removed ${deletedEesh.deletedCount} record(s) for Eesh Tripathi.`);
    }
  } catch (err) {
    console.error("[SeedMembers] Error removing Eesh Tripathi:", err.message);
  }

  // Ensure Dhanvanth is in Software
  try {
    await Member.updateOne(
      { name: { $regex: /dhanvanth/i } },
      { $set: { department: "Software", phone: "7418056603", img: "/members/2026/DhanvanthChandrasekaran - Dhanvanth Chandrasekaran.jpg" } }
    );
  } catch (err) {
    console.error("[SeedMembers] Error updating Dhanvanth department:", err.message);
  }

  // Ensure all member image paths in MongoDB point to /members/2026/ (except Prof & Alumni)
  try {
    const nonProfMembers = await Member.find({
      isProf: { $ne: true },
      isAlumni: { $ne: true },
    }).lean();

    const imageUpdateOps = [];
    nonProfMembers.forEach((member) => {
      if (member.img && !member.img.startsWith("/members/2026/")) {
        const fileName = member.img.split("/").pop();
        if (fileName) {
          imageUpdateOps.push({
            updateOne: {
              filter: { _id: member._id },
              update: { $set: { img: `/members/2026/${fileName}` } },
            },
          });
        }
      }
    });

    if (imageUpdateOps.length > 0) {
      await Member.bulkWrite(imageUpdateOps, { ordered: false });
      console.log(`[SeedMembers] Updated ${imageUpdateOps.length} member images to /members/2026/ folder.`);
    }
  } catch (err) {
    console.error("[SeedMembers] Error normalizing member image paths:", err.message);
  }
}
