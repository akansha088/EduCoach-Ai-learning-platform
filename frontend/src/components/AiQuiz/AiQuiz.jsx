
import { useEffect } from "react";

const ExternalRedirect = ({ url }) => {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return <p>Redirecting to AI Quiz...</p>;
};

export default ExternalRedirect;
