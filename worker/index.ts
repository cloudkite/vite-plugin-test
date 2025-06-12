export default {
  fetch(request: Request) {
    const url = new URL(request.url);
    console.log(request.url);

    if (url.pathname.startsWith("/subpath/api/")) {
      return Response.json({
        name: "Cloudflare",
      });
    }
    return new Response(null, { status: 404 });
  },
};
