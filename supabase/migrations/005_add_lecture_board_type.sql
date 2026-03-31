-- 강의공고 게시판 타입 추가
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_board_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_board_type_check CHECK (
  board_type IN ('notice','review','photo_gallery','video_gallery','resource','lecture')
);
