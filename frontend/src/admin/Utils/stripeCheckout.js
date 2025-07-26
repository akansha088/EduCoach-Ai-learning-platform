import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export const redirectToCheckout = async (sessionId) => {
  const stripe = await stripePromise;
  await stripe.redirectToCheckout({ sessionId });
};
