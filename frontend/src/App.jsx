import { useState } from "react";
import "./App.css"
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer"

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header />
      <Footer />
    </>
  );
}

export default App;
