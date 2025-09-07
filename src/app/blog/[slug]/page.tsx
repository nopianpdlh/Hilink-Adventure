// src/app/blog/[slug]/page.tsx

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

async function getPostBySlug(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('blog_posts')
        .select(`
            title,
            content,
            published_at,
            author:profiles (email)
        `)
        .eq('slug', slug)
        .neq('published_at', null)
        .single();

    if (error || !data) {
        return null;
    }
    return data;
}

export default async function BlogPostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="bg-white min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-gray-900">
                        <span className="text-green-600">HiLink</span> Adventure
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link href="/blog" className="font-semibold text-green-600">Blog</Link>
                        {user ? (
                             <Link href="/dashboard/my-bookings" className="font-medium text-gray-700 hover:text-green-600">Dashboard</Link>
                        ) : (
                            <Link href="/login" className="text-gray-800 hover:text-green-600 font-medium">Login</Link>
                        )}
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 py-12">
                <article className="prose lg:prose-xl max-w-4xl mx-auto">
                    <h1>{post.title}</h1>
                    <p className="text-gray-500">
                        Oleh {(post.author as any)?.email || 'Admin'} • Dipublikasikan pada {new Date(post.published_at!).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </article>
            </main>
        </div>
    );
}
