CREATE OR REPLACE FUNCTION public.get_event_logs(
    IN p_devices_selected integer[],
    IN p_like_event_status character varying[],
    IN p_like_event_date_from timestamp without time zone,
    IN p_like_event_date_to timestamp without time zone,
    IN p_like_card_number character varying,
    IN p_page character varying,
    IN p_skip character varying,
    IN p_sort_by character varying,
    IN p_sort_order character varying)
  RETURNS TABLE(id bigint, status_symbol character varying, event_status_description character varying, event_date character varying, event_time character varying, card_number character varying, markers character varying, signals bytea, events character varying, device_id character varying, device_name character varying, date_time timestamp without time zone, device_mode_description character varying) AS
$BODY$
    declare
      vSortOrder text;
      vSortBy text;
      in_clause ALIAS FOR $1;
    BEGIN
      if p_sort_order = 'asc' then
        vSortOrder := 'asc';
      else
        vSortOrder := 'desc';
      end if;
      vSortBy := 'date_time';
      if (p_sort_by = 'card_number' or p_sort_by = 'date_time') then
        vSortBy := p_sort_by;
      end if;
    RETURN QUERY EXECUTE
	'select
            el.id,
            el.status_symbol::character varying,
            es.description event_status_description,
            to_char(el.date_time, ''DD.MM.YYYY'')::character varying event_date,
            to_char(el.date_time, ''HH24:MI:SS'')::character varying event_time,
            el.card_number,
            el.markers,
            el.signals,
            el.events,
            el.device_id::character varying,
            d.name device_name,
            el.date_time date_time,
            dm.description device_mode_description
         from event_log el
         join device d on el.device_id = d.id
         left join event_log_status es on el.status_symbol = es.status_symbol
         left join device_mode dm on el.mode_symbol = dm.mode_symbol
         where
         ($2 is null or el.status_symbol=ANY($2) or (''E''=ANY($2) and el.status_symbol is null)) and
         (el.date_time >= $3 and el.date_time < ($4)
		and el.creation >= ($3 - interval ''11 hours'') and el.creation < ($4 + interval ''11 hours'')
         ) and
         ($5 is null or $5 = '''' or el.card_number = $5) and
         el.device_id=ANY($1)
         order by ' || quote_ident(vSortBy) || ' ' || vSortOrder ||
	' LIMIT $7::int OFFSET ($6::int - 1) * $7::int'
	USING p_devices_selected,
	p_like_event_status,
	p_like_event_date_from,
	p_like_event_date_to,
	p_like_card_number,
	p_page,
	p_skip;
    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.get_event_logs(integer[], character varying[], timestamp without time zone, timestamp without time zone, character varying, character varying, character varying, character varying, character varying)
  OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.get_event_logs_count(
    IN p_devices_selected integer[],
    IN p_like_event_status character varying[],
    IN p_like_event_date_from timestamp without time zone,
    IN p_like_event_date_to timestamp without time zone,
    IN p_like_card_number character varying)
  RETURNS TABLE (items_count bigint) AS
$BODY$
    BEGIN
      -- Есть глюк между драйвером node.js и Postgres.
      -- Если компилировать хранимую процедуру с возвращаемым типом RETURNS TABLE (items_count bigint) AS
      -- то Postgres преобразовывает такой TABLE с одним полем в SETOF bigint.
      -- Если скомпилировать процедуру с другим названием поля, например RETURNS TABLE (id bigint) AS,
      -- то в node.js выдает структуру {get_transactions_count_by_mask: '25'} , а не {items_count: '25'}.
      -- причем в скомилированной функции уже не видно как назывался параметр, т.к. возвращаемый тпи преобразован в SETOF bigint
      -- То есть в node.js непонятно какое имя у результата. То ли get_transactions_count_by_mask, то ли items_count.
      -- Подобные функции пока комилируем внимательно с возвращаемым типом RETURNS TABLE (items_count bigint)
            
    RETURN QUERY EXECUTE
	'select count(*) items_count            
         from event_log el         
         where
         ($2 is null or el.status_symbol=ANY($2) or (''E''=ANY($2) and el.status_symbol is null)) and
         (el.date_time >= $3 and el.date_time < ($4)
		and el.creation >= ($3 - interval ''11 hours'') and el.creation < ($4 + interval ''11 hours'')		
         ) and
         ($5 is null or $5 = '''' or el.card_number = $5) and
         el.device_id=ANY($1)'         
	USING p_devices_selected,
	p_like_event_status,
	p_like_event_date_from,
	p_like_event_date_to,
	p_like_card_number;   
    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.get_event_logs_count(integer[], character varying[], timestamp without time zone, timestamp without time zone, character varying)
  OWNER TO postgres;

CREATE TABLE IF NOT EXISTS settings(
    id SERIAL PRIMARY KEY,
    namespace character varying,
    code character varying NOT NULL,
    value character varying NOT NULL
);

CREATE TABLE IF NOT EXISTS device_settings(
    device_id integer NOT NULL,
    setting_id smallint NOT NULL,
    CONSTRAINT device_settings_pk PRIMARY KEY (device_id, setting_id),
    CONSTRAINT device_settings_to_settings_fk FOREIGN KEY (setting_id) REFERENCES settings (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);

--
-- Function: get_setting(code, namespace)
--

CREATE OR REPLACE FUNCTION get_setting(_code character varying, _namespace character varying DEFAULT '') RETURNS TABLE(value character varying)
    LANGUAGE plpgsql
    AS $$
    BEGIN
	RETURN QUERY
	select
		s.value
	from settings s
	where
		s.code = _code and
		s.namespace = _namespace
	order by s.id desc;
    END;
$$;


ALTER FUNCTION public.get_setting(_code character varying, _namespace character varying) OWNER TO postgres;

--
-- Function: get_device_setting(device_id, code, namespace)
--

CREATE OR REPLACE FUNCTION get_device_setting(_device_id integer, _code character varying, _namespace character varying DEFAULT '') RETURNS TABLE(value character varying)
    LANGUAGE plpgsql
    AS $$
    BEGIN
	RETURN QUERY
	select
	    s.value
	from device_settings ds
	    left join settings s on ds.setting_id = s.id
	where
	    ds.device_id = _device_id and
	    s.code = _code and
	    s.namespace = _namespace
	order by s.id desc;
    END;
$$;


ALTER FUNCTION public.get_device_setting(_device_id integer, _code character varying, _namespace character varying) OWNER TO postgres;

---
--- Default settings
---

DELETE FROM settings WHERE true;

INSERT INTO settings(id, namespace, code, value) VALUES (11, '', 'device_state', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (12, '', 'exit_button', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (13, '', 'door_sensor', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (14, '', 'gas_sensor', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (15, '', 'vibration_sensor', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (16, '', 'tilt_sensor', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (17, '', 'ups_sensor', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (18, '', 'lock', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (19, '', 'green_lamp', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (110, '', 'red_lamp', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (111, '', 'siren', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (112, '', 'light', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (113, '', 'relay1', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (114, '', 'relay2', '1');

INSERT INTO settings(id, namespace, code, value) VALUES (21, '', 'device_state', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (22, '', 'exit_button', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (23, '', 'door_sensor', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (24, '', 'gas_sensor', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (25, '', 'vibration_sensor', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (26, '', 'tilt_sensor', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (27, '', 'ups_sensor', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (28, '', 'lock', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (29, '', 'green_lamp', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (210, '', 'red_lamp', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (211, '', 'siren', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (212, '', 'light', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (213, '', 'relay1', '1');
INSERT INTO settings(id, namespace, code, value) VALUES (214, '', 'relay2', '1');

DELETE FROM device_settings WHERE true;

INSERT INTO device_settings(device_id, setting_id) VALUES (1, 11);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 12);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 13);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 14);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 15);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 16);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 17);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 18);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 19);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 110);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 111);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 112);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 113);
INSERT INTO device_settings(device_id, setting_id) VALUES (1, 114);

INSERT INTO device_settings(device_id, setting_id) VALUES (2, 11);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 12);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 13);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 14);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 15);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 16);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 17);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 18);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 19);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 110);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 111);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 112);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 113);
INSERT INTO device_settings(device_id, setting_id) VALUES (2, 114);

CREATE OR REPLACE FUNCTION save_device_setting(_device_id integer, _code character, _value character, _namespace character varying DEFAULT '') RETURNS BOOLEAN
    LANGUAGE plpgsql
    AS $$
    DECLARE
       setting_id int;
    BEGIN
        select into setting_id
	    s.id
	from device_settings ds
	    left join settings s on ds.setting_id = s.id
	where
	    ds.device_id = _device_id and
	    s.code = _code and
	    s.namespace = _namespace
	order by s.id desc;

	if setting_id is NULL then
	    insert into settings(code, namespace, value) values (_code, _namespace, _value);
	    select currval('settings_id_seq') into setting_id;
	    insert into device_settings(device_id, setting_id) values (_device_id, setting_id);
	else
	    update settings
	    set value = _value
	    where id = setting_id;
	end if;

	RETURN true;
    END;
$$;

ALTER FUNCTION public.save_device_setting(_device_id integer, _code character, _value character, _namespace character varying) OWNER TO postgres;