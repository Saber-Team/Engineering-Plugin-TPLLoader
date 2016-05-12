{{extends attr=foo file="bar.tpl"}}

{{extends name="bar.tpl" file="bar.tpl"}}

{{extends file="bar.tpl"
}}

{{extends name="foo"
          file="bar.tpl" }}

{{extends file="bar.tpl"
          name="foo" }}