def walk(f):
  . as $in
  | if type == "object" then
      reduce keys_unsorted[] as $key
        ( {}; . + { ($key):  ($in[$key] | walk(f)) } ) | f
  elif type == "array" then map( walk(f) ) | f
  else f
  end;

def keys_sort_by(f):
  to_entries | sort_by(.key|f ) | from_entries;

walk(if type == "object" then keys_sort_by(ascii_upcase) else . end)