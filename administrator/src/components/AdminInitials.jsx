function AdminInitials({ name, className = "" }) {
  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "A";

  return (
    <span className={`admin-initials ${className}`.trim()} aria-label={name || "Admin"}>
      {initials}
    </span>
  );
}

export default AdminInitials;
