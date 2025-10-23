import axios from "axios";
import tokenManager from "../lib/tokenManager.js";

const PostLeadVerification = async (req, res) => {
  try {
    const data = req.body;

    console.log("data from zoho", data);

    // Get current date and subtract 12 hours 30 minutes
    const now = new Date();

    // current time (no subtraction of 12 hours or 30 minutes)
    const currentDate = new Date();

    // Format to Zoho datetime: YYYY-MM-DDTHH:mm:ss+hh:mm
    const formatZohoDatetime = (date) => {
      const pad = (n) => String(n).padStart(2, "0");

      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours()); // 24-hour format
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());

      const tzOffset = -date.getTimezoneOffset(); // in minutes
      const sign = tzOffset >= 0 ? "+" : "-";
      const tzHours = pad(Math.floor(Math.abs(tzOffset) / 60));
      const tzMinutes = pad(Math.abs(tzOffset) % 60);

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${tzHours}:${tzMinutes}`;
    };

    // Assign_Time in 24-hour format
    const Assign_Time1 = formatZohoDatetime(currentDate);

    // Valid_Till = Assign_Time + 1 minute
    const validTillDate = new Date(currentDate.getTime() + 1 * 60 * 1000); // add 1 min
    const valid_till = formatZohoDatetime(validTillDate);

    console.log("Assign_Time1:", Assign_Time1); // e.g., 2025-10-22T14:45:30+05:30
    console.log("Valid_Till:", valid_till); // e.g., 2025-10-22T14:46:30+05:30

    console.log(" Zoho datetime:", Assign_Time1);

    const dataMap = {
      Dev_Id_Rem: 2,
      Sub_Campaign_Name: `${data.data.Sub_Campaign_Name}`,
      Assign_Time: `${Assign_Time1}`,
      Dev_Id: data.data.Dev_Id,
      Owner: `${data.data.Lead_Verification_Owner}`,
      Name: `${data.data.Lead_Verification_Name}`,
      Sub_Campaign_ID: `${data.data.Sub_Campaign_Name}`,
      Campaign_Name: `${data.data.Campaign_id}`,
      Valid_Till: valid_till, // <- Zoho datetime format
      Lead_Name: `${data.data.Lead_Name}`,
      Email: `${data.data.Email}`,
      Agent_Phone_No: `${data.data.Agent_Phone_No}`,
      Agent_Name: `${data.data.Agent_Name}`,
      Status: `${data.data.Status}`,
    };

    const payload = { data: [dataMap], trigger: ["workflow"] };
    console.log("payload", payload);
    // Get current token from token manager
    const token = tokenManager.getToken();
    if (!token) {
      console.error("❌ No valid token available for Zoho API request");
      return res.status(500).json({
        error: "Authentication token not available",
        message: "Please try again in a moment",
      });
    }

    const headers = {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      "https://www.zohoapis.com/crm/v8/Lead_Verifications",
      payload,
      { headers }
    );
    // console.log(response.data);
    console.log(
      "✅ Record created successfully:",
      JSON.stringify(response.data)
    );
    res.status(201).json({ message: "mubarak hoooo" });
  } catch (error) {
    if (error.response) {
      console.error("❌ Zoho Error Status:", error.response.status);
      console.error(
        "❌ Zoho Error Data:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error("❌ Request Error:", error);
    }
    // console.log(error);
    res.status(400).json({ error: "Zoho request failed" });
  }
};

export { PostLeadVerification };
