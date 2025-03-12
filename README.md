# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Features

## Notifications

- Email Notifications (resend, React-email)
- Text Notifications (Twilio)

### Blog

- ✅ Blog editor (client)
- ✅ Blog frontend (server component)

### Store

- ✅ Product creation (physical and digital) (client-side)
- ✅ Product - Stripe Linking
- ✅ Product Variant creation
- ✅ Draft and Live Product Variants
- ✅ Store Checkout through Stripe
- ✅ Tax & Shipping Estimates (included)
- ✅Cart with cookie persistant storage
- ✅Order confirmation page
- ✅Product Search and filtering based upon Category
- ✅Automated Stripe Data Sync (1 way (Next -> Stripe), create, update, delete)
- ✅Address Validation
- ✅ Phone Number collection on every order. Address only required on physical orders.
- ✅ Automated Reciept Generation
- ✅UniqueRich Preview Cards for every Item in the store
- ✅Auto-populate checkout information from user profile
- ✅Checkout as guest or with account
- ✅Uses Stripe Test keys in develotment for testing webhooks and payment completion data.
- ✅7 day cookie storage for cart items

#### Store - Coming Soon

- Order Management & Fufillment (coming soon)
- Discount Codes (coming soon)
- Product Reviews (coming soon)
- Cancelations (coming soon)
- Refunds (coming soon)

## User Accounts

- ✅User information (name, email, phone, address)
- User Permissions (canComment, canRespond, canReview - Admin control)
- isSubscribed (Email Subscribers)
- isSubscribed ( )
- ✅Name Parser
- ✅Order History

## Subscriptions

- ✅ Stripe Subscription
- Automated Subscription Creation (coming soon)
- Subscription Management (coming soon)
- Subscription Billing (coming soon)
- Subscription Cancellation (coming soon)
- Subscription Pause (coming soon)
- Stripe Customer Portal (coming soon)

## Services

- Createable DashboardService Panel (Client) (coming soon)
- Services (Server) (coming soon)
- Scheduling Dashboard (Availability, notifications) (Client) (coming soon)
- Scheduling with Services Filtering (Server) (coming soon)
- Stripe Quotes [link](https://docs.stripe.com/quotes) (coming soon)

## Tasks

- Task Creation (Client) (coming soon)
- Task Management (Kanban) (Client) (coming soon)
- Task Management (Calendar) (Client) (coming soon)
- Task Management (List) (Client) (coming soon)
- Task Management (Board) (Client) (coming soon)
- Task Management (Gantt) (Client) (coming soon)

## Invoices

- Invoice Creation (client) (Coming Soon)
- Template editor (client) (Coming Soon)
- Invoice history (client) (Coming Soon)
- Invoice PDF export (client) (Coming Soon)
- Invoice email send (client) (Coming Soon)
- Invoice reminder (client) (Coming Soon)
- Invoice template creation (client) (Coming Soon)

## CRM

- Contact Management (client) (Coming Soon)
- Contact Management (server) (Coming Soon)
- Contact Management (dashboard) (client) (Coming Soon)

## Training and personel management

- Employee Management (client) (Coming Soon)
- Training and progress tracking (client) (Coming Soon)
- Employee scheduling (client) (Coming Soon)
- Employee onboarding (client) (Coming Soon)
- Job Board (client) (Coming Soon)
- Job App Management platform (client) (Coming Soon)

## Other

- Resume Builder (client) (Coming Soon)
- Reciept Management (client) (Coming Soon)
- ✅ Database Seeding (still in progress)

## Don't forget

[ ] Even though items may be limited to 1, it still allows us to keep adding more by clicking the add to cart button. Same with items with limited stock. The quantity is locked but we can still keep clicking the add to cart button.
[ ] Need to implement an inventory management system.
[ ] Ability to cancel orders.

## Minor issues

[ ] Shop searchbar isn't searching based upon all parameters ( name, description, category, variant name, variant description)
