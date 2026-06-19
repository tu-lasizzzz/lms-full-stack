import { Webhook } from "svix";
import User from "../models/User.js";
import stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
import { Notification } from "../models/Notification.js";



// API Controller Function to Manage Clerk User with database
export const clerkWebhooks = async (req, res) => {
  try {

    // Create a Svix instance with clerk webhook secret.
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    // Verifying Headers
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    })

    // Getting Data from request body
    const { data, type } = req.body

    // Switch Cases for differernt Events
    switch (type) {
      case 'user.created': {

        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
          resume: ''
        }
        await User.create(userData)
        
        // Auto-generate Welcome Notification
        await Notification.create({
            userId: data.id,
            title: "Welcome to LMS TAT 🎉",
            message: `Welcome to LMS TAT, ${userData.name}! We're excited to have you join our learning community. Explore courses, track your progress, and build new skills at your own pace. Happy Learning!`,
            type: "welcome"
        });

        res.json({})
        break;
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        }
        await User.findByIdAndUpdate(data.id, userData)
        res.json({})
        break;
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id)
        res.json({})
        break;
      }
      default:
        break;
    }

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// Stripe Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)


// Stripe Webhooks to Manage Payments Action
export const stripeWebhooks = async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }
  catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {

      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;

      const purchaseData = await Purchase.findById(purchaseId)
      const userData = await User.findById(purchaseData.userId)
      const courseData = await Course.findById(purchaseData.courseId.toString())
      const educatorData = await User.findById(courseData.educator)

      courseData.enrolledStudents.push(userData)
      await courseData.save()

      userData.enrolledCourses.push(courseData._id)
      await userData.save()

      purchaseData.status = 'completed'
      await purchaseData.save()

      // Auto-generate Enrollment Notification
      await Notification.create({
          userId: userData._id,
          title: "Enrollment Successful 🎓",
          message: `Congratulations, ${userData.name}! You have successfully enrolled in '${courseData.courseTitle}' by ${educatorData.name}. Start learning, track your progress, and complete the course to earn your certificate.`,
          type: "enrollment"
      });

      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;

      const purchaseData = await Purchase.findById(purchaseId)
      purchaseData.status = 'failed'
      await purchaseData.save()

      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({ received: true });
}