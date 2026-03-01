import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

// Nuclear option to remove lovable/gptengineer artifacts
const cleanup = () => {
  const selectors = [
    '#lovable-badge',
    '.lovable-badge',
    '[class*="lovable"]',
    '[id*="lovable"]',
    '#gpt-engineer-badge',
    '.gpt-engineer-badge',
    'iframe[src*="lovable"]',
    'script[src*="lovable"]',
    'script[src*="gpteng.co"]'
  ];
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      console.log('Removing Lovable artifact:', selector);
      el.remove();
    });
  });
};

// Use MutationObserver for continuous monitoring
const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => cleanup());
});

observer.observe(document.body, { childList: true, subtree: true });

// Run multiple times as well
cleanup();
window.addEventListener('load', cleanup);
setInterval(cleanup, 2000);
