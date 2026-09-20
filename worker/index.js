export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --------------------------------------------------
    // Pilot 0.5 API health check
    // --------------------------------------------------
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

    // --------------------------------------------------
    // Pilot 0.5 cloud state API
    // /api/infection-control/state/{workspaceId}
    // --------------------------------------------------
    const stateMatch = url.pathname.match(
      /^\/api\/infection-control\/state\/([A-Za-z0-9_-]+)$/
    );

    if (stateMatch) {
      const workspaceId = stateMatch[1];

      // -------------------------
      // GET：讀取雲端資料
      // -------------------------
      if (request.method === "GET") {
        try {
          const row = await env.DB.prepare(
            `
            SELECT workspace_id, payload, updated_at
            FROM pilot_state
            WHERE workspace_id = ?
            `
          )
            .bind(workspaceId)
            .first();

          if (!row) {
            return Response.json({
              success: true,
              found: false,
              workspace_id: workspaceId,
              data: null
            });
          }

          return Response.json({
            success: true,
            found: true,
            workspace_id: row.workspace_id,
            data: JSON.parse(row.payload),
            updated_at: row.updated_at
          });
        } catch (error) {
          return Response.json(
            {
              success: false,
              message: String(error)
            },
            { status: 500 }
          );
        }
      }

      // -------------------------
      // PUT：儲存雲端資料
      // -------------------------
      if (request.method === "PUT") {
        try {
          const body = await request.json();

          if (
            body === null ||
            typeof body !== "object" ||
            Array.isArray(body)
          ) {
            return Response.json(
              {
                success: false,
                message: "Request body must be a JSON object."
              },
              { status: 400 }
            );
          }

          const updatedAt = new Date().toISOString();
          const payload = JSON.stringify(body);

          await env.DB.prepare(
            `
            INSERT INTO pilot_state (
              workspace_id,
              payload,
              updated_at
            )
            VALUES (?, ?, ?)
            ON CONFLICT(workspace_id)
            DO UPDATE SET
              payload = excluded.payload,
              updated_at = excluded.updated_at
            `
          )
            .bind(workspaceId, payload, updatedAt)
            .run();

          return Response.json({
            success: true,
            saved: true,
            workspace_id: workspaceId,
            updated_at: updatedAt
          });
        } catch (error) {
          return Response.json(
            {
              success: false,
              message: String(error)
            },
            { status: 500 }
          );
        }
      }

      return Response.json(
        {
          success: false,
          message: "Method not allowed."
        },
        {
          status: 405,
          headers: {
            Allow: "GET, PUT"
          }
        }
      );
    }

    // 其他網址仍交給 AML 原本的靜態網站
    return env.ASSETS.fetch(request);
  }
};
