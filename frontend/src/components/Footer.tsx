import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Моя Удмуртия</h3>
            <p className="text-sm text-muted-foreground">
              Туристический портал для путешествий по Удмуртской Республике.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Навигация</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/" className="text-sm hover:underline">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/attractions" className="text-sm hover:underline">
                  Достопримечательности
                </Link>
              </li>
              <li>
                <Link to="/tours" className="text-sm hover:underline">
                  Экскурсии
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Контакты</h3>
            <p className="text-sm text-muted-foreground">
              Email: info@myudmurtia.ru
              <br />
              Телефон: +7 (3412) 123-45-67
            </p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Моя Удмуртия. Все права защищены.
        </div>
      </div>
    </footer>
  );
};

export default Footer;