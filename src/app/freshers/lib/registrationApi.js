// Client abstraction for submitting freshers registration data

export async function submitFreshersRegistration(data) {
  try {
    const response = await fetch("/api/freshers/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.msg || result.message || result.error || "Transmission failed. Crewmate data rejected.",
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (err) {
    console.error("REGISTRATION TRANSMISSION ERROR:", err);
    return {
      success: false,
      error: "Comms link failure. Could not transmit data to spaceship command.",
    };
  }
}
