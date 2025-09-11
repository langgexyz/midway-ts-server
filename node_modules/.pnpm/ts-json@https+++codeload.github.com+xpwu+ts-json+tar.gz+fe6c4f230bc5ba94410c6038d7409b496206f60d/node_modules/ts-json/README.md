# ts-json
从json字符串中解析出一个已定义的类，或者把类转化为json字符串。

## 1、基本使用
1、类中属性的类型与json字符串中的类型必须满足js类型的一致性；    
2、类中属性的类型如果是某一类型与null的组合类型，在类型检查时，忽略null类型；  
3、所有的属性都必须有初始化值，如果json字符串中没有对某个域重新设值，
返回的实例中该域仍是初始设定的值。

```typescript

class A {
    a: number = 10
    c: string|null = "this is a string"
}

// expect(ret).toBe(`{"a":10,"c":"this is a string"}`)
let ret = new Json().toJson(new A())

let jsn = `{"a":15,"c":"it's ok"}`

// expect(a).toBeInstanceOf(A)
// expect(a.a).toBe(15)
// expect(a.c).toBe(`it's ok`)
// expect(err).toBeNull()
let [a,err] = new Json().fromJson(jsn, A)


```

## 2、类、数组的嵌套
1、数组中的成员的类型必须一致；   
2、类的属性可以是数组，数组的成员也可以是类类型；   
3、类类型的属性必须用类的实例初始化；   
4、数组也必须初始化，如果是成员是类，则必须用new ClassArray(A) 初始化数组的值，
但是具体使用该项值时，仍然与普通数组一样使用   


```typescript

class Msg {
  id: string = ""
  content: string = "this is a content"
  sender: string = ""
  aa: A = new A()
  as: A[] = new ClassArray(A)
  array: string[] = []

  public getSender():string {
    return this.id + this.sender
  }
}

let msg = new Msg()
  msg.id = "1234567890"
  msg.sender = "fromC"
  msg.aa.a = 20

  /* ret = 
  {
    "id":"1234567890",
    "content":"this is a content",
    "sender":"fromC",
    "aa":{
      "a":20,
      "c":"this is a string"
    },
    "as":[],
    "array":[]
  }
  */
  let ret = new Json().toJson(msg)
  expect(ret).toBe(`{"id":"1234567890","content":"this is a content","sender":"fromC","aa":{"a":20,"c":"this is a string"},"as":[],"array":[]}`)

  let [m, err] = new Json().fromJson(ret, Msg)
  expect(err).toBeNull()
  expect(m.getSender()).toBe("1234567890fromC")

```

## 3、null的处理
1、默认情况下，json字符串不允许设定某一个字段的值为null，在类型检查中会报错，
如果实例中有字段的值为null，toJson会忽略；  
2、可以通过allowNull() 或者 ignoreNull()重置默认值；  
3、allowNull 会添加null的字段到json字符串中，也会对json字符串中的null解析给实例；   
4、ignoreNull 会忽略所有的null

```typescript

let a = new A()
  a.c = null

  // {"a":10}
  let ret = new Json().toJson(a)
  expect(ret).toBe(`{"a":10}`)

  // {"a":10,"c":null}
  ret = new Json().allowNull().toJson(a)
  expect(ret).toBe(`{"a":10,"c":null}`)

  // {"a":10}
  ret = new Json().ignoreNull().toJson(a)
  expect(ret).toBe(`{"a":10}`)

  let str = `{"a":10,"c":null}`

  let [, err1] = new Json().fromJson(str, A)
  expect(err1?.message).toBe(`A.c---can not null`)

  let [ins, err] = new Json().allowNull().fromJson(str, A)
  expect(err).toBeNull()
  expect(ins.c).toBeNull()

  let [ins1, err2] = new Json().ignoreNull().fromJson(str, A)
  expect(err2).toBeNull()
  expect(ins1.c).toBe("this is a string")

```

## 4、重定义key
1、可以重新设定键名；   
2、如果指定为 - 表示忽略此项。   

```typescript

class TestJsonKey {
  @JsonKey("f")
  f1: string = "f1"
  f2: number = 9
  @JsonKey("-")
  f3: boolean = true
}


  let ret = new Json().toJson(new TestJsonKey())
  expect(ret).toBe(`{"f":"f1","f2":9}`)

  let [ins, err] = new Json().fromJson(`{"f":"f","f2":9, "f3":false}`, TestJsonKey)
  expect(err).toBeNull()
  expect(ins.f1).toBe("f")
  expect(ins.f3).toBe(true)

```

## 5、判断json字符串是否有某一项

```typescript

class TestJsonKey {
  @JsonKey("f")
  f1: string = "f1"
  f2: number = 9
  @JsonKey("-")
  f3: boolean = true
}

  let [ins, err] = new Json().fromJson(`{"f":"f", "f3":false}`, TestJsonKey)
  expect(err).toBeNull()

  let has = JsonHas(ins)
  expect(has.f1).toBe(true)
  expect(has.f2).toBe(false)
  expect(has.f3).toBe(false)

```
对于嵌套类型，逐层检测即可。   
也可以使用 JsonHasAll() 检查全部字段。

## 6、RawJson    
1、暂缓解析，保留原json数据，比如分步解析   
2、不再编码，保留现有的JsonType，比如逐层构造
```typescript

class User {
  name: string = ""
  age: number = 0
}

class Response {
  code: number = 200
  data: RawJson = new RawJson()
}

const json = `{"code":200, "data":{"name":"xp", "age":18}}`

// 第一层解析，保留了 data 的原始数据
let res = new Json().fromJson(json, Response)
expect(res[1]).toBeNull()
expect(res[0].code).toBe(200)

// 第二层解析，解析 data 的数据
let user = new Json().fromJson(res[0].data.raw, User)
expect(user[1]).toBeNull()
expect(user[0]).toEqual({
  name: "xp",
  age: 18
})

```

