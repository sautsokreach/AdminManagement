declare module "swagger-ui-react" {
  import React from "react";
  interface SwaggerUIProps {
    spec?: object;
    url?: string;
    docExpansion?: "list" | "full" | "none";
    defaultModelsExpandDepth?: number;
    tryItOutEnabled?: boolean;
    [key: string]: unknown;
  }
  const SwaggerUI: React.ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
