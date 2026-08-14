-- local a = 1
-- local b = 2

-- if a < b then
--     print("Lua")
-- end

function detector(a,b)
    if a > b then
        print(a)
    elseif a < b then
        print(b)
    else
        print("같습니다")
end

local a,b = io.read():macth("(%d+)%s+(%d+)")
detector(a,b)