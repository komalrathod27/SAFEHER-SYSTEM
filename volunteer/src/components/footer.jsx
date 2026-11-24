function Footer() {
  return (
    <footer className="copyright">
      <p>
        © {new Date().getFullYear()}{" "}
        <span style={{ color: "#198568", fontWeight: 600 }}>SafeHer</span>. All rights
        reserved.
      </p>
    </footer>
  );
}

export default Footer;
