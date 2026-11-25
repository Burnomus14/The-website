import Image from "next/image";

const socialLinks = [
  {
    label: "Email",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=sachngor14%40gmail.com",
    icon: "/images/footer/email.png",
  },
  {
    label: "Telegram",
    href: "https://t.me/schngor",
    icon: "/images/footer/telegram.png",
  },
  {
    label: "Discord",
    href: "https://discord.com/users/1497973667064184895",
    icon: "/images/footer/discord.png",
  },
  {
    label: "X",
    href: "https://x.com/___sachngor",
    icon: "/images/footer/x.png",
  },
] as const;

export default function Footer() {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-divider" aria-hidden="true" />

      <div className="footer-brand-block">
        <Image
          className="footer-brand"
          src="/images/footer/brand.svg"
          alt="That Josh Guy"
          width={60}
          height={60}
        />
        <span className="footer-copyright">
          &copy;{new Date().getFullYear()} Onesmus Schngor
        </span>
      </div>

      <div className="footer-contact-block">
        <span className="footer-contact-label">Hit me up</span>
        <div className="footer-socials" aria-label="Contact links">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              className="footer-social-link"
              aria-label={social.label}
              title={social.label}
              {...(social.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <Image
                src={social.icon}
                alt=""
                width={40}
                height={40}
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
