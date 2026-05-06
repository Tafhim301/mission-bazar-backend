import { Router } from "express";
import { authRoutes }            from "../modules/auth/auth.routes";
import { userRoutes }            from "../modules/user/user.routes";
import { categoryRoutes }        from "../modules/category/category.routes";
import { productRoutes }         from "../modules/product/product.routes";
import { orderRoutes }           from "../modules/order/order.routes";
import { paymentRoutes }         from "../modules/payment/payment.routes";
import { reviewRoutes }          from "../modules/review/review.routes";
import { carouselRoutes }        from "../modules/carousel/carousel.routes";
import { featuredRoutes }        from "../modules/featured/featured.routes";
import { statsRoutes }           from "../modules/stats/stats.routes";
import { vendorEarningRoutes }   from "../modules/vendor-earning/vendor-earning.routes";
import { withdrawRequestRoutes } from "../modules/withdraw-request/withdraw-request.routes";
import { payoutRoutes }          from "../modules/payout/payout.routes";
import { vendorRoutes }          from "../modules/vendor/vendor.routes";
import { vendorDocumentRoutes }  from "../modules/vendor-document/vendor-document.routes";

export const router = Router();

const moduleRoutes = [
  { path: "/auth",     route: authRoutes            },
  { path: "/user",     route: userRoutes            },
  { path: "/category", route: categoryRoutes        },
  { path: "/product",  route: productRoutes         },
  { path: "/order",    route: orderRoutes           },
  { path: "/payment",  route: paymentRoutes         },
  { path: "/review",   route: reviewRoutes          },
  { path: "/carousel", route: carouselRoutes        },
  { path: "/featured", route: featuredRoutes        },
  { path: "/stats",    route: statsRoutes           },
  // ── Vendor onboarding system ─────────────────────────────────────────────
  { path: "/vendor",      route: vendorRoutes         },  // POST /vendor/apply, GET /vendor/me, PATCH /vendor/me, POST /vendor/submit, GET|PATCH /vendor/:id
  { path: "/vendor-docs", route: vendorDocumentRoutes },  // POST /vendor-docs (upload), GET /vendor-docs/my, GET|PATCH /vendor-docs (admin)
  // ── Vendor payout system ──────────────────────────────────────────────────
  { path: "/earnings", route: vendorEarningRoutes   },  // GET /earnings, GET /earnings/my, GET /earnings/my/wallet, POST /earnings/release
  { path: "/withdraw", route: withdrawRequestRoutes },  // POST /withdraw, GET /withdraw/my, GET /withdraw, PATCH /withdraw/:id/approve|reject
  { path: "/payout",   route: payoutRoutes          },  // POST /payout, GET /payout, GET /payout/my
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));
