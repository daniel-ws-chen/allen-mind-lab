export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Pilot 0.5 API health check
    if (
      url.pathname === "/api/infection-control/health" &&
      request.method === "GET"
    ) {
      try {
        const result = await env.DB.prepare("SELECT 1 AS ok").first();

        return Response.json({
          success: true,
          service: "AML Infection Control Pilot 0.5",
          database: result?.ok === 1 ? "connected" : "unknown"
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            service: "AML Infection Control Pilot 0.5",
            database: "error",
            message: String(error)
          },
          { status: 500 }
        );
      }
    }

    // 其他網址仍交給 AML 原本的靜態網站
    return env.ASSETS.fetch(request);
  }
};
