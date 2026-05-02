import { Router } from "express";
import { authRoutes }     from "../modules/auth/auth.routes";
import { userRoutes }     from "../modules/user/user.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { productRoutes }  from "../modules/product/product.routes";
import { orderRoutes }    from "../modules/order/order.routes";
import { paymentRoutes }  from "../modules/payment/payment.routes";
import { reviewRoutes }   from "../modules/review/review.routes";
import { carouselRoutes } from "../modules/carousel/carousel.routes";
import { featuredRoutes } from "../modules/featured/featured.routes";
import { statsRoutes }    from "../modules/stats/stats.routes";

export const router = Router();

const moduleRoutes = [
  { path: "/auth",     route: authRoutes     },
  { path: "/user",     route: userRoutes     },
  { path: "/category", route: categoryRoutes },
  { path: "/product",  route: productRoutes  },
  { path: "/order",    route: orderRoutes    },
  { path: "/payment",  route: paymentRoutes  },
  { path: "/review",   route: reviewRoutes   },
  { path: "/carousel", route: carouselRoutes },
  { path: "/featured", route: featuredRoutes },
  { path: "/stats",    route: statsRoutes    },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));
