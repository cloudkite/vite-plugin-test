import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [name, setName] = useState("unknown");

  return (
    <button
      type="button"
      onClick={() => {
        fetch("/subpath/api/")
          .then((res) => res.json() as Promise<{ name: string }>)
          .then((data) => setName(data.name));
      }}
      aria-label="get name"
    >
      Name from API is: {name}
    </button>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
