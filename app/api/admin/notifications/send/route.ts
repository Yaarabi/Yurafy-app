import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Notification from "@/models/notification";
import User from "@/models/users";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { emailService } from "@/lib/services/emailService";

/**
 * POST: Send notification and/or email to users
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const { type, recipientType, recipientEmail, title, message, link } = body;

        if (!title || !message) {
            return NextResponse.json(
                { error: 'Title and message are required' },
                { status: 400 }
            );
        }

        let recipients = [];

        // Determine recipients
        if (recipientType === 'all') {
            recipients = await User.find({}, '_id email username').lean() as any[];
        } else if (recipientType === 'specific' && recipientEmail) {
            const user = await User.findOne({ email: recipientEmail }, '_id email username').lean() as any;
            if (!user) {
                return NextResponse.json(
                    { error: 'User not found with that email' },
                    { status: 404 }
                );
            }
            recipients = [user];
        } else {
            return NextResponse.json(
                { error: 'Invalid recipient type or missing email' },
                { status: 400 }
            );
        }

        let notificationsSent = 0;
        let emailsSent = 0;

        // Send notifications and/or emails
        for (const recipient of recipients) {
            // Send in-app notification
            if (type === 'notification' || type === 'both') {
                await Notification.create({
                    owner: recipient._id,
                    type: 'admin_message',
                    title,
                    message,
                    link: link || undefined,
                    read: false,
                });
                notificationsSent++;
            }

            // Send email
            if (type === 'email' || type === 'both') {
                try {
                    await emailService.sendEmail({
                        to: recipient.email,
                        subject: title,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #4F46E5;">${title}</h2>
                                <p style="color: #374151; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                                ${link ? `<p><a href="${link}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View More</a></p>` : ''}
                                <hr style="margin: 20px 0; border: none; border-top: 1px solid #E5E7EB;">
                                <p style="color: #6B7280; font-size: 12px;">This is a message from Yurafy Admin. Please do not reply to this email.</p>
                            </div>
                        `,
                    });
                    emailsSent++;
                } catch (emailError) {
                    console.error('Error sending email to', recipient.email, emailError);
                    // Continue with other recipients even if one fails
                }
            }
        }

        return NextResponse.json({ 
            message: `Successfully sent! Notifications: ${notificationsSent}, Emails: ${emailsSent}`,
            notificationsSent,
            emailsSent,
        });
    } catch (error: any) {
        console.error('Error sending notifications/emails:', error);
        return NextResponse.json(
            { error: 'Failed to send notifications/emails' },
            { status: 500 }
        );
    }
}
