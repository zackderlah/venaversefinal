--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Comment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Comment" (
    id integer NOT NULL,
    text text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewId" integer NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public."Comment" OWNER TO neondb_owner;

--
-- Name: Comment_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public."Comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Comment_id_seq" OWNER TO neondb_owner;

--
-- Name: Comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public."Comment_id_seq" OWNED BY public."Comment".id;


--
-- Name: CurrentlyExperiencing; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CurrentlyExperiencing" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    progress text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    creator text NOT NULL,
    "imageUrl" text,
    seasons character varying(191),
    year character varying(191)
);


ALTER TABLE public."CurrentlyExperiencing" OWNER TO neondb_owner;

--
-- Name: CurrentlyExperiencing_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public."CurrentlyExperiencing_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CurrentlyExperiencing_id_seq" OWNER TO neondb_owner;

--
-- Name: CurrentlyExperiencing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public."CurrentlyExperiencing_id_seq" OWNED BY public."CurrentlyExperiencing".id;


--
-- Name: ProfileComment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProfileComment" (
    id integer NOT NULL,
    text text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" integer NOT NULL,
    "profileId" integer NOT NULL
);


ALTER TABLE public."ProfileComment" OWNER TO neondb_owner;

--
-- Name: ProfileComment_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public."ProfileComment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProfileComment_id_seq" OWNER TO neondb_owner;

--
-- Name: ProfileComment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public."ProfileComment_id_seq" OWNED BY public."ProfileComment".id;


--
-- Name: Review; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Review" (
    id integer NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    creator text NOT NULL,
    year integer NOT NULL,
    rating double precision NOT NULL,
    review text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "imageUrl" text,
    "userId" integer NOT NULL
);


ALTER TABLE public."Review" OWNER TO neondb_owner;

--
-- Name: Review_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public."Review_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Review_id_seq" OWNER TO neondb_owner;

--
-- Name: Review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public."Review_id_seq" OWNED BY public."Review".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "profileImage" text,
    bio text,
    "favoriteReviewId" integer,
    "recentActivity" jsonb,
    "selectedTitleCategory" character varying(191),
    "selectedTitle" character varying(191)
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO neondb_owner;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Name: Comment id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Comment" ALTER COLUMN id SET DEFAULT nextval('public."Comment_id_seq"'::regclass);


--
-- Name: CurrentlyExperiencing id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CurrentlyExperiencing" ALTER COLUMN id SET DEFAULT nextval('public."CurrentlyExperiencing_id_seq"'::regclass);


--
-- Name: ProfileComment id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProfileComment" ALTER COLUMN id SET DEFAULT nextval('public."ProfileComment_id_seq"'::regclass);


--
-- Name: Review id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Review" ALTER COLUMN id SET DEFAULT nextval('public."Review_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Comment" (id, text, "createdAt", "reviewId", "userId") FROM stdin;
1	Great review mate	2025-05-16 07:16:37.119	2	1
2	Nice bro	2025-05-16 08:37:25.754	7	1
4	My boyfriend and I watched this with rising floodwaters taking over his room. It led to our first night together in the same bed. It was magical - witnessing such natural beauty laid before us: the flood, the inferno, and our shared, same-sex attraction, which led us into deep, forsaken fantasy.	2025-05-19 03:52:38.108	9	6
5	shove a beer up yar boss's arse mate!	2025-05-20 06:14:38.388	21	1
\.


--
-- Data for Name: CurrentlyExperiencing; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CurrentlyExperiencing" (id, "userId", title, type, progress, "createdAt", "updatedAt", creator, "imageUrl", seasons, year) FROM stdin;
6	1	Girls	tv		2025-05-18 21:07:14.001	2025-05-19 07:36:27.135	Lena Dunham	https://m.media-amazon.com/images/M/MV5BMTU1Mzk2ODEzN15BMl5BanBnXkFtZTgwNDQwMjAxMTI@._V1_SX300.jpg	6	2012ΓÇô2017
10	1	Dandadan	anime		2025-05-19 06:41:41.442	2025-05-19 07:36:27.198	Science Saru	https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx171018-60q1B6GK2Ghb.jpg		2024
11	1	The Myth Of Sisyphus	book		2025-05-19 06:44:50.314	2025-05-19 07:36:27.233	Albert Camus	http://books.google.com/books/content?id=zaPoAQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api		2013
19	7	Homoerotic Foreplay	other	on the edge	2025-05-20 06:07:19.175	2025-05-20 06:07:19.175	Myself	\N	Γê₧	2025
\.


--
-- Data for Name: ProfileComment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProfileComment" (id, text, "createdAt", "userId", "profileId") FROM stdin;
1	test	2025-05-18 18:57:13.282	1	1
3	i wuv you 	2025-05-18 19:01:30.02	1	5
4	tuturu!	2025-05-19 17:31:54.315	1	6
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Review" (id, title, category, creator, year, rating, review, date, "imageUrl", "userId") FROM stdin;
1	Eternal Sunshine of the Spotless Mind	film	Michel Gondry	2004	9		2025-05-13 00:00:00	https://m.media-amazon.com/images/M/MV5BMTY4NzcwODg3Nl5BMl5BanBnXkFtZTcwNTEwOTMyMw@@._V1_SX300.jpg	1
5	The Banshees of Inisherin	film	Martin McDonagh	2022	9		2025-05-13 00:00:00	https://m.media-amazon.com/images/M/MV5BOTkzMWI4OTEtMTk0MS00MTUxLWI4NTYtYmRiNWM4Zjc1MGRhXkEyXkFqcGc@._V1_SX300.jpg	1
2	Loveless	music	My Bloody Valentine	1991	10	I was 19 years old when my friends sucker punched me with Only Shallow for the first time.  We were drinking and ripping nangs in their sharehouse in one of the bedrooms - it was a pretty ethereal moment for me. I couldn't tell if I loved or hated it, but it was nothing like I'd heard before at the time. One thing I did know for sure, was that I couldn't stop thinking about it - the intense whirring of the guitar and haunting vocals had been etched into my mind. I remember listening to the rest of the album shortly after, as it became obvious I was listening to a masterpiece. Loveless is the landmark album for shoegaze. It is hypnotic, emotionally intimate, and evokes a particularly nostalgic mood in me with each listen. Nothing has come close to Loveless's power, and I fear nothing will in my lifetime. Kevin Shields is the goat, and I'm positive his monstrous power will annihilate me when I watch mbv perform live.	2025-05-13 00:00:00	https://coverartarchive.org/release/b1ce7f03-4835-489e-9a0a-13124c6c0a9e/front-250	1
7	Ping Pong the Animation	anime	Masaaki Yuasa	2014	10	My all time favourite. I watch ping pong every single year, specifically around Christmas time, so I can sync it up with the Christmas eve song in episode 6. This show touches my heart deeply in various, almost inexplainable ways. I suppose it could be the wonderful character development, complimented by immersive storytelling through Yuasa Masaaki's unique animation. Or maybe it's the perfectly constructed sound track by Kensuke Ushio. Unsurprisingly, after showing my friends this show, we played table tennis everyday for 6 months straight. Ping Pong the Animation is a lesser known masterpiece, which I will continue rewatching often until the day I die.	2025-05-14 00:00:00	https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20607-fIOxVISIl0HY.jpg	1
8	Diary of a Wimpy Kid	books	Jeff Kinney	2007	10	Zooweemama!!	2025-05-17 14:36:13.042	https://covers.openlibrary.org/b/id/14376136-L.jpg	5
9	Into the Inferno	film	Werner Herzog	2016	9	.	2025-05-18 20:23:32.933	https://m.media-amazon.com/images/M/MV5BMTAyNzYyNjg1NzJeQTJeQWpwZ15BbWU4MDY4NzE1MzAy._V1_SX300.jpg	5
3	Neon Genesis Evangelion	anime	Hideaki Anno	1995	9		2025-05-13 00:00:00	https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx30-AI1zr74Dh4ye.jpg	1
4	Berserk	books	Kentaro Miura	1989	9		2025-05-13 00:00:00	https://covers.openlibrary.org/b/id/869205-L.jpg	1
6	Prison School	anime	Tsutomu Mizushima	2015	10	Easily the funniest anime I have seen. Absurd and over the top show with ridiculous yet incredibly relatable male characters who had me in tears basically the entire time. The underground student council girls are all sexy and waifu material as fuck. The animation is disgustingly good and unexpected for a show of its nature. Watched initially as a teen, but was a more enjoyable rewatch as a young adult with the bros.	2025-05-13 00:00:00	https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20807-8nFoO0AUdGsy.jpg	1
21	Another Round	film	Thomas Vinterberg	2020	10	inspiring movie that gave me the confidence to live my life the way god intended.\nmy boss didn't appreciate this and now i am unemployed.\n	2025-05-20 05:41:19.518	https://m.media-amazon.com/images/M/MV5BNjYxN2EwYjUtNzdiOS00NTgwLTgwNzMtZmE1NGMzYTYxNzBjXkEyXkFqcGc@._V1_SX300.jpg	7
22	The Art Of Shen Ku	books	Zeek	2001	8	this book needs to be in every classroom across the globe.	2025-05-20 06:17:14.971	https://covers.openlibrary.org/b/id/260707-L.jpg	7
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, username, password, "isAdmin", "createdAt", email, "updatedAt", "profileImage", bio, "favoriteReviewId", "recentActivity", "selectedTitleCategory", "selectedTitle") FROM stdin;
2	testuser	$2b$10$PfUwzrKJHlgwZMLwND5tPOUms7IDk1PR5.WxdTr/KoGeQ5HrvmtCm	f	2025-05-15 17:47:44.281	user2@example.com	2025-05-16 12:16:05.902	\N	\N	\N	\N	\N	\N
3	test	$2b$10$fqRI8gz0Ds8qsPVUwGcS9u3F7jcD7ZU.SzsBMJMRa1h.ANU7zRb5W	f	2025-05-15 18:22:24.169	user3@example.com	2025-05-16 12:16:05.902	\N	\N	\N	\N	\N	\N
4	test123	$2b$10$3vrgvGMMw9WXIozEIYQwpeBUHXhvlXbQAsws5NCRJfoLvVsxttMLq	f	2025-05-16 14:33:57.882	test@gmail.com	2025-05-16 14:33:57.882	\N	\N	\N	\N	\N	\N
1	johnny	$2b$10$YNGD4db5gGL.iLold/IVauPW.yVhE40dCRtGiagMz0qzKdm4D7HI6	t	2025-05-15 17:40:25.008	user1@example.com	2025-05-17 11:01:54.275	https://res.cloudinary.com/dgpkcrmkf/image/upload/v1747479713/xa9te8lrb3vs3sgyuoeo.jpg	HELLO WORLD\n	\N	\N	\N	\N
5	FungusAmongus	$2b$10$m56v7RyKSzGP2BGKjjx6m.2hqB6oMCfwDAmwzOQDB59F1hF.crvz2	f	2025-05-17 13:42:16.598	aidancoorey99@gmail.com	2025-05-18 20:29:54.172	https://res.cloudinary.com/dgpkcrmkf/image/upload/v1747492847/aey5waw3xseytklttshi.jpg	Hungry hungry boys designated top fag and heaps awpsome	\N	\N	\N	\N
6	Josh	$2b$10$OJrMeDRr529oozE.N33EJOgk62WSmqBncZ9CqQoHbU0F2TcFxqVcW	f	2025-05-18 06:20:05.346	stumerjoshua@gmail.com	2025-05-19 03:33:02.375	https://res.cloudinary.com/dgpkcrmkf/image/upload/v1747625581/nooo6dxj9qhp3njswoy4.webp	transfem Valorant IGL and coach	\N	\N	\N	\N
7	brodie	$2b$10$p421qaY4APkGRpw9Md.RF.UOppaainZ93MrGVa0e4eRwvTIFLX1R2	f	2025-05-18 06:20:28.811	brodiemuir1@y7mail.com	2025-05-20 06:10:06.635	https://res.cloudinary.com/dgpkcrmkf/image/upload/v1747718868/etavs8ukldfjtjz1mdpr.jpg	peaked global elite 2016	\N	\N	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Name: Comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public."Comment_id_seq"', 5, true);


--
-- Name: CurrentlyExperiencing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public."CurrentlyExperiencing_id_seq"', 19, true);


--
-- Name: ProfileComment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public."ProfileComment_id_seq"', 4, true);


--
-- Name: Review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public."Review_id_seq"', 22, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public."User_id_seq"', 7, true);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: CurrentlyExperiencing CurrentlyExperiencing_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CurrentlyExperiencing"
    ADD CONSTRAINT "CurrentlyExperiencing_pkey" PRIMARY KEY (id);


--
-- Name: ProfileComment ProfileComment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProfileComment"
    ADD CONSTRAINT "ProfileComment_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: CurrentlyExperiencing_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CurrentlyExperiencing_userId_idx" ON public."CurrentlyExperiencing" USING btree ("userId");


--
-- Name: User_favoriteReviewId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_favoriteReviewId_key" ON public."User" USING btree ("favoriteReviewId");


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Comment Comment_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public."Review"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Comment Comment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CurrentlyExperiencing CurrentlyExperiencing_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CurrentlyExperiencing"
    ADD CONSTRAINT "CurrentlyExperiencing_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProfileComment ProfileComment_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProfileComment"
    ADD CONSTRAINT "ProfileComment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProfileComment ProfileComment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProfileComment"
    ADD CONSTRAINT "ProfileComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_favoriteReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_favoriteReviewId_fkey" FOREIGN KEY ("favoriteReviewId") REFERENCES public."Review"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

