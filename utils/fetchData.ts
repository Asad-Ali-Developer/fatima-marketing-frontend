// // lib/fetchUtils.ts
// "use server"; // 👈 Ensures this file is treated as server-only

// import { headers } from "next/headers";

// type SuccessCallback = (data: any) => void;
// type ErrorCallback = (error: Error) => void;

// export function fetchData(
//   url: string,
//   onSuccess: SuccessCallback,
//   onError: ErrorCallback
// ): void {
//   try {
//     // ✅ Call headers() directly — it returns Headers (not a Promise)
//     const hdrs = headers();
//     const authHeader = hdrs.get("authorization");

//     let token: string | null = null;
//     if (authHeader && authHeader.startsWith("Bearer ")) {
//       token = authHeader.substring(7);
//     }

//     if (!token) {
//       return onError(new Error("No Bearer token in Authorization header"));
//     }

//     fetch(url, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       next: { revalidate: 0 },
//     })
//       .then(async (res) => {
//         if (!res.ok) {
//           const text = await res.text();
//           throw new Error(`HTTP ${res.status}: ${text}`);
//         }
//         return res.json();
//       })
//       .then(onSuccess)
//       .catch((err) => {
//         onError(new Error(err.message || "Fetch failed"));
//       });
//   } catch (error) {
//     // headers() can throw if called outside server context
//     onError(new Error("Headers unavailable — ensure this runs on the server"));
//   }
// }
