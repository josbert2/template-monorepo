import styles from "./Hero.module.css";
import { Button, Card, CardBody } from "@turbo-with-tailwind-v4/design-system";


export default function Hero() {
  return (
    <div className={styles.wrap}>
      <Card className="max-w-3xl">
        <CardBody>
          <h1 className={styles.title}>
            Lanza tu landing en minutos
          </h1>
          <h2 className="text-xl font-bold">
            From tailwind 4
          </h2>
          <p className={styles.sub}>
            Este proyecto aísla los estilos por app con CSS Modules y Tailwind,
            y comparte componentes desde <code>@acme/ui</code>.
          </p>
          <div className={styles.ctas}>
            <Button>Comenzar</Button>
            <Button variant="primary">Ver componentes</Button>
            <button className="bg-red-600 text-white hover:bg-red-700">From tailwindcss</button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
