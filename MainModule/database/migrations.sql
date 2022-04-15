CREATE TABLE files
(
    id serial NOT NULL,
    original_name character varying NOT NULL,
    download_path character varying NOT NULL,
    PRIMARY KEY (id)
);


CREATE TABLE users
(
    id serial NOT NULL,
    name character varying NOT NULL,
    lastname character varying NOT NULL,
    city character varying,
    swaps_count integer NOT NULL,
    raiting double precision NOT NULL,
    photo_id integer,
    phone_number character varying UNIQUE NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT photo_id FOREIGN KEY (photo_id)
            REFERENCES public.files (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE
            NOT VALID
);


CREATE TABLE sms_auth_data (
    phone_number character varying PRIMARY KEY,
    sms_code character varying,
    sms_expired_time TIMESTAMP
);

CREATE TABLE orders
(
    id serial NOT NULL,
    user_id integer NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    counter_offer character varying NOT NULL,
    is_free boolean NOT NULL,
    is_hidden boolean NOT NULL,
    photo_data integer[],
    date timestamp without time zone NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
);


CREATE TABLE tags
(
    id serial NOT NULL,
    tag_name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE tag_to_order
(
    order_id integer NOT NULL,
    tag_id integer NOT NULL,
    PRIMARY KEY (order_id, tag_id),
    CONSTRAINT order_id FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT tag_id FOREIGN KEY (tag_id)
        REFERENCES public.tags (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
);

CREATE TABLE device_token_to_user
(
    user_id integer NOT NULL,
    device_token character varying NOT NULL,
    PRIMARY KEY (user_id, device_token),
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
);

CREATE TABLE favorite_orders
(
    user_id integer NOT NULL,
    order_id integer NOT NULL,
    PRIMARY KEY (user_id, order_id),
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT order_id FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
);

CREATE TABLE deals
(
    id serial NOT NULL,
    user_id integer NOT NULL,
    order_id integer NOT NULL,
    comment character varying,
    status character varying NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT order_id FOREIGN KEY (order_id)
        REFERENCES orders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
);

CREATE TABLE chats
(
    id serial NOT NULL,
    user1_id integer NOT NULL,
    user2_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    last_message_date timestamp with time zone,
    PRIMARY KEY (id),
    CONSTRAINT user1_id FOREIGN KEY (user1_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT user2_id FOREIGN KEY (user2_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
);

CREATE TABLE messages
(
    id serial NOT NULL,
    id_string character varying UNIQUE NOT NULL,
    chat_id integer NOT NULL,
    user_id_from integer NOT NULL,
    content_type character varying NOT NULL,
    forward character varying,
    content character varying NOT NULL,
    status character varying NOT NULL,
    date timestamp with time zone NOT NULL,
    data_info character varying,
    PRIMARY KEY (id),
    CONSTRAINT chat_id FOREIGN KEY (chat_id)
        REFERENCES public.chats (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT user_id_from FOREIGN KEY (user_id_from)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
);

CREATE TABLE mute
(
    user_id integer NOT NULL,
    chat_id integer NOT NULL,
    PRIMARY KEY (user_id, chat_id),
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT chat_id FOREIGN KEY (chat_id)
        REFERENCES public.chats (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
);