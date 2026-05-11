"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function SwaggerUIComponent({ spec }: { spec: object }) {
  return (
    <SwaggerUI
      spec={spec}
      docExpansion="list"
      defaultModelsExpandDepth={-1}
      tryItOutEnabled={true}
    />
  );
}
