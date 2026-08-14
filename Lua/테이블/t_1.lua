local t = {1,2,3}

local a = io.read()
table.insert(t,4,a)
for i=1, #t do
    print(t[i])
end

-- for i=1, #t do
--     print("hello")
-- end