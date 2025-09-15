import styles from "./Hero.module.css";
import { Button, Card, CardBody } from "@acme/ui";

export default function Hero() {
  return (
    <div className={styles.wrap}>
      <Card className="max-w-3xl">
        <CardBody>
          <h1 className={styles.title}>
            Lanza tu landing en minutos
          </h1>
          <p className={styles.sub}>
            Este proyecto aísla los estilos por app con CSS Modules y Tailwind,
            y comparte componentes desde <code>@acme/ui</code>.
          </p>
          <div className={styles.ctas}>
            <Button>Comenzar</Button>
            <Button variant="outline">Ver componentes</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
