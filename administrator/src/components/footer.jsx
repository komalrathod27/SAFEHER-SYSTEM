function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="d-sm-flex justify-content-center justify-content-sm-between">
          <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">
            © {new Date().getFullYear()}{" "}
            <span style={{ color: "#392c70", fontWeight: 600 }}>SafeHer</span>. All
            rights reserved.
          </span>
        </div>
      </footer>
    </>
  );
}
export default Footer;
