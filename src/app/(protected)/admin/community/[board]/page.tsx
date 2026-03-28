import { getPostsByBoard } from "@/lib/supabase/queries";
import CommunityBoardClient from "./CommunityBoardClient";

const boardNames: Record<string, string> = {
  notice: "공지사항",
  review: "교육후기",
  photo_gallery: "교육사진 갤러리",
  video_gallery: "영상갤러리",
  resource: "자료실",
};

export default async function AdminCommunityBoardPage({ params }: { params: Promise<{ board: string }> }) {
  const { board } = await params;
  const boardLabel = boardNames[board] || board;
  const posts = await getPostsByBoard(board);

  return <CommunityBoardClient board={board} boardLabel={boardLabel} posts={posts} />;
}
