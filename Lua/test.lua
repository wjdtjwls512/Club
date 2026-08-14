local m = require("함수.모듈.m2")

local a,b = io.read():match("(%d+)%s+(%d+)")
print(m.sub(a,b))