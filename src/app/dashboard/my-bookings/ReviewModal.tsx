// src/app/dashboard/my-bookings/ReviewModal.tsx
'use client'

import { createReview } from "@/app/actions";
import { useState } from "react";
import { Star } from "lucide-react";

export default function ReviewModal({ trip, bookingId }: { trip: any, bookingId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    const handleFormSubmit = async (event: React.FormEvent) => {
        const formData = new FormData(event.target as HTMLFormElement);
        try {
            await createReview(formData);
            setIsOpen(false);
            // Idealnya, berikan notifikasi sukses di sini
        } catch (error) {
            console.error(error);
            // Idealnya, berikan notifikasi error di sini
        }
    };

    if (!trip) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-sm font-medium text-green-600 hover:underline"
            >
                Beri Ulasan
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Ulasan untuk {trip.title}</h2>
                        <form action={createReview}>
                            <input type="hidden" name="trip_id" value={trip.id} />
                            <input type="hidden" name="booking_id" value={bookingId} />
                            <input type="hidden" name="rating" value={rating} />
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`cursor-pointer h-8 w-8 ${
                                                (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                            fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Komentar</label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                    placeholder="Bagaimana pengalamanmu di trip ini?"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                                    Kirim Ulasan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
