"use client"
import { Bookmark, MessageSquare, Share2, ThumbsUp, User } from "lucide-react";
import { ShortReport } from "@/types/report.type";
import { formatDate } from "@/lib/formatDate";
import { useRouter } from "next/navigation";

export default function PostCard({ report }: { report: ShortReport }) {
    const router = useRouter()
    const handleClick = () => {
        router.push(`/post/${report.postId}`)
    }
    return (
        <article onClick={handleClick} className="bg-white rounded-xl p-4 sm:p-6 border border-outline-variant shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:shadow-md transition-all active:scale-[0.99] touch-manipulation group cursor-pointer">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                <div className="flex gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-on-surface-variant" />
                    </div>
                    <div>
                        <h2 className="text-headline-sm md:text-headline-md font-headline-md text-primary leading-tight">{report.title}</h2>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">{formatDate({ date: report.createdAt })}</p>
                    </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-[11px] font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#64748B]"></span>
                        {report.status}
                    </span>
                    <span className="text-[11px] sm:text-label-sm font-label-sm text-secondary bg-secondary/5 px-2 py-0.5 rounded truncate">{report.location}</span>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {report.description}
                </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
                <div className="flex gap-4 sm:gap-6">
                    <button className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors py-1 cursor-pointer">
                        <ThumbsUp className="w-5 h-5" />
                        <span className="text-label-md font-label-md">42</span>
                    </button>
                    <button className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors py-1 cursor-pointer">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-label-md font-label-md">3</span>
                    </button>
                </div>
                <div className="flex gap-1">
                    <button className="p-2 hover:bg-surface-container rounded-lg transition-colors cursor-pointer text-on-surface-variant hover:text-secondary">
                        <Bookmark className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-surface-container rounded-lg transition-colors cursor-pointer text-on-surface-variant hover:text-secondary">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </article>
    )
}
