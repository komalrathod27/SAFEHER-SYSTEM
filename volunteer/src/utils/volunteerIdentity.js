export function getVolunteerId() {
  const storedValues = [
    sessionStorage.getItem("mydata"),
    localStorage.getItem("mydata"),
  ];

  for (const storedValue of storedValues) {
    if (!storedValue) continue;

    try {
      const user = JSON.parse(storedValue);
      const volunteerId = user.user_id || user._id || user.id;
      if (volunteerId) return String(volunteerId);
    } catch (error) {
      console.error("Unable to read volunteer login information:", error);
    }
  }

  return null;
}
