const [fileContent, fileContent2] = await Promise.all(vars.files.map(({ file }) => file.text()))

const {
  definition: { functions: appFunctions, variables: appVariables, ...appDefRest },
  layouts: appLayouts,
  ...appRest
} = JSON.parse(fileContent)

const {
  definition: { functions: app2Functions, variables: app2Variables, ...app2DefRest },
  layouts: app2Layouts,
  ...app2Rest
} = JSON.parse(fileContent2)

let app = { functions: appFunctions, variables: appVariables, layouts: appLayouts }
let app2 = { functions: app2Functions, variables: app2Variables, layouts: app2Layouts }

let appChanges = {
  titles: [`${appRest.name} [${appRest.code}]`, `${app2Rest.name} [${app2Rest.code}]`],
  functions: [],
  variables: [],
  layouts: [],
  rest: [],
}

const OPS = {
  rm: { id: 1, priority: 4, name: "Removal" },
  add: { id: 2, priority: 3, name: "Addition" },
  ro: { id: 3, priority: 2, name: "Reorder" },
  mod: { id: 4, priority: 1, name: "Modification" },
}

const recurseObject = (obj, func) => {
  ;(function recurse(obj, keyPath = []) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const item = obj[i]
        const kp = [...keyPath, i]
        const stopRecursion = func(i, item, obj, kp)

        if (!stopRecursion && typeof item === "object" && item !== null) {
          recurse(item, kp)
        }
      }
    } else {
      const entries = Object.entries(obj)

      for (const [key, val] of entries) {
        const kp = [...keyPath, key]
        const stopRecursion = func(key, val, obj, kp)

        if (!stopRecursion && typeof val === "object" && val !== null) {
          recurse(val, kp)
        }
      }
    }
  })(obj)
}

const walkPath = (obj, path, destinationOnly = true) => {
  let value = obj
  let i = 0

  while (i < path.length) {
    const pathSegment = path[i]

    if (isObject(value) && Object.hasOwn(value, pathSegment)) {
      value = value[pathSegment]
      i++
    } else {
      if (destinationOnly) value = undefined
      break
    }
  }

  const walkedPath = path.slice(0, i)

  return { value, walkedPath, destinationReached: walkedPath.length === path.length }
}

const isObject = (x) => typeof x === "object" && x !== null

const isPlainObject = (x) => isObject(x) && !Array.isArray(x)

const isExprVal = (x) =>
  isPlainObject(x) &&
  Object.hasOwn(x, "tag") &&
  (x.tag === "val" || x.tag === "expr") &&
  Object.hasOwn(x, "expr") &&
  typeof x.expr === "string"

const sortObjects = (items, keyPaths, order) => {
  const paths = Array.isArray(keyPaths) ? keyPaths : [keyPaths]

  return [...items].sort((a, b) => {
    for (const path of paths) {
      const aVal = lodash.get(a, path)
      const bVal = lodash.get(b, path)

      if (aVal === bVal) continue

      if (typeof aVal === "string" && typeof bVal === "string") {
        const comparison = aVal.localeCompare(bVal)

        if (comparison !== 0) return comparison * order
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        if (aVal < bVal) return -1 * order
        if (aVal > bVal) return 1 * order
      }
    }

    return 0
  })
}

const sortObjectsAsc = (items, keyPaths) => sortObjects(items, keyPaths, 1)

const verifyArrsByPath = (arr, arr2, keyPath) => {
  const result = lodash.isEqual(
    arr.map((item) => lodash.get(item, keyPath)),
    arr2.map((item) => lodash.get(item, keyPath))
  )

  return result
}

const difference = (arr, arr2, comparator) => {
  return arr.filter((item) => !arr2.some((item2) => comparator(item, item2)))
}

const differenceByPath = (arr, arr2, keyPath) =>
  difference(arr, arr2, (item, item2) => lodash.get(item, keyPath) === lodash.get(item2, keyPath))

const intersection = (a, b, comparator) => a.filter((item) => b.some((item2) => comparator(item, item2)))

const findIndices = (arr, comparator = (a, b) => a === b) => {
  let registeredItems = []

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    const registeredItem = registeredItems.find((registeredItem) => comparator(registeredItem[0], item))

    if (registeredItem) {
      registeredItem[1].push(i)
    } else {
      registeredItems.push([item, [i]])
    }
  }

  return registeredItems
}

const findReorderedIndices = (arr, arr2, comparator) => {
  const intersectedItems = intersection(arr, arr2, comparator)
  const arrIndices = findIndices(arr, comparator)
  const arr2Indices = findIndices(arr2, comparator)

  let reorderedItems = []

  for (const intersectedItem of intersectedItems) {
    const itemIndices = arrIndices.find(([item]) => comparator(item, intersectedItem))[1]
    const item2Indices = arr2Indices.find(([item]) => comparator(item, intersectedItem))[1]

    if (itemIndices.length !== 1 || item2Indices.length !== 1) {
      throw new Error("There should be single item in both sets considering reordering.")
    }

    const index = itemIndices[0]
    const index2 = item2Indices[0]

    if (index !== index2) {
      reorderedItems.push([index, index2])
    }
  }

  return reorderedItems
}

const findReorderedIndicesByPath = (arr, arr2, keyPath) =>
  findReorderedIndices(arr, arr2, (a, b) => lodash.get(a, keyPath) === lodash.get(b, keyPath))

const genAddOrRmChangeRecord = (op, def, idKeyPath, genDisplayValue, valueKeyPath, key) => {
  return {
    op,
    def,
    id: isPlainObject(def) ? lodash.get(def, idKeyPath) : undefined,
    displayValue: genDisplayValue(def),
    keyPath: valueKeyPath,
    key: key ?? valueKeyPath?.at(-1),
  }
}

const genRemovalChangeRecord = (def, idKeyPath, genDisplayValue, valueKeyPath, key) => {
  return genAddOrRmChangeRecord(OPS.rm.id, def, idKeyPath, genDisplayValue, valueKeyPath, key)
}

const genAdditionChangeRecord = (def, idKeyPath, genDisplayValue, valueKeyPath, key) => {
  return genAddOrRmChangeRecord(OPS.add.id, def, idKeyPath, genDisplayValue, valueKeyPath, key)
}

const genModificationChangeRecord = (value, value2, valueKeyPath, key) => {
  return {
    op: OPS.mod.id,
    values: [value, value2],
    keyPath: valueKeyPath,
    key: key ?? valueKeyPath?.at(-1),
  }
}

const genReorderChangeRecord = (def, index, def2, index2, idKeyPath, genDisplayValue) => {
  return {
    op: OPS.ro.id,
    defs: [def, def2],
    ids: [
      isPlainObject(def) ? lodash.get(def, idKeyPath) : undefined,
      isPlainObject(def2) ? lodash.get(def2, idKeyPath) : undefined,
    ],
    displayValues: [genDisplayValue(def), genDisplayValue(def2)],
    indices: [index, index2],
  }
}

const retrieveRemovals = (entities, entities2, genDisplayValue, idKeyPath = "id") => {
  return differenceByPath(entities, entities2, idKeyPath).map((def) =>
    genRemovalChangeRecord(
      def,
      idKeyPath,
      genDisplayValue,
      undefined,
      entities.findIndex((item) => lodash.get(item, idKeyPath) === lodash.get(def, idKeyPath))
    )
  )
}

const retrieveAdditions = (entities, entities2, genDisplayValue, idKeyPath = "id") => {
  return differenceByPath(entities2, entities, idKeyPath).map((def) =>
    genAdditionChangeRecord(
      def,
      idKeyPath,
      genDisplayValue,
      undefined,
      entities2.findIndex((item) => lodash.get(item, idKeyPath) === lodash.get(def, idKeyPath))
    )
  )
}

const filterOutRegisteredEntities = (entities, records, idKeyPath = "id") =>
  entities.filter((item) => !records.some((record) => record.id === lodash.get(item, idKeyPath)))

const areSomeChangesRegistered = (registerOfChanges) =>
  Object.entries(registerOfChanges).some(([k, v]) => k !== "titles" && v.length > 0)

const sortChanges = (changes) => {
  const priorities = Object.values(OPS).reduce((acc, { id, priority }) => ({ ...acc, [id]: priority }), {})

  return changes.toSorted((a, b) => priorities[b.op] - priorities[a.op])
}

const diffEntities = (def, def2, entitiesArgs, registerOfChanges) => {
  for (let [key, { genDisplayValue, idKeyPath }] of Object.entries(entitiesArgs)) {
    idKeyPath ??= "id"

    const removals = retrieveRemovals(def[key], def2[key], genDisplayValue, idKeyPath)
    const additions = retrieveAdditions(def[key], def2[key], genDisplayValue, idKeyPath)
    const reorders = findReorderedIndicesByPath(def[key], def2[key], idKeyPath)
      .filter(([from, to]) => {
        const removalsBefore = removals.filter(({ key }) => key <= to)
        const additionsBefore = additions.filter(({ key }) => key < to)
        const balance = additionsBefore.length - removalsBefore.length

        return from + balance !== to
      })
      .map(([from, to]) => genReorderChangeRecord(def[key][from], from, def2[key][to], to, idKeyPath, genDisplayValue))

    registerOfChanges[key].push(...reorders)

    registerOfChanges[key].push(...removals)
    def[key] = sortObjectsAsc(filterOutRegisteredEntities(def[key], removals, idKeyPath), idKeyPath)

    registerOfChanges[key].push(...additions)
    def2[key] = sortObjectsAsc(filterOutRegisteredEntities(def2[key], additions, idKeyPath), idKeyPath)

    const doRemainingEntitiesFullyIntersect = verifyArrsByPath(def[key], def2[key], idKeyPath)

    if (!doRemainingEntitiesFullyIntersect) {
      throw new Error(
        `Remaining entities don't fully intersect for key '${key}'. Based on IDs under the path '${idKeyPath}'.`
      )
    }
  }
}

const diffDefs = (def, def2, registerOfChanges) => {
  // Reordering/Modifications/Removals
  let keyPath2 = []

  recurseObject(def, (key, val, obj, keyPath) => {
    keyPath2 = keyPath2.slice(0, keyPath.length - 1)
    keyPath2.push(key)

    if (Array.isArray(obj) && isPlainObject(val) && val.id) {
      const { value: obj2, destinationReached } = walkPath(def2, keyPath2.slice(0, -1))

      if (destinationReached && Array.isArray(obj2)) {
        const key2 = obj2.findIndex((item) => isPlainObject(item) && item.id && item.id === val.id)

        if (key2 !== -1 && key2 !== key) {
          keyPath2[keyPath2.length - 1] = key2
          return
        }
      }
    }

    const { value: val2, destinationReached } = walkPath(def2, keyPath2)
    const meaningfulKey = keyPath.at(isExprVal(obj) ? -2 : -1)

    if (destinationReached) {
      if (isObject(val) && isObject(val2)) return

      if (val !== val2) {
        registerOfChanges.push(genModificationChangeRecord(val, val2, keyPath, meaningfulKey))
        return true
      }
    } else {
      registerOfChanges.push(genRemovalChangeRecord(val, "id", (def) => def?.name?.val ?? "", keyPath, meaningfulKey))
      return true
    }
  })

  // Additions
  let keyPath = []

  recurseObject(def2, (key2, val2, obj2, keyPath2) => {
    keyPath = keyPath.slice(0, keyPath2.length - 1)
    keyPath.push(key2)

    if (Array.isArray(obj2) && isPlainObject(val2) && val2.id) {
      const { value: obj, destinationReached } = walkPath(def, keyPath.slice(0, -1))

      if (destinationReached && Array.isArray(obj)) {
        const key = obj.findIndex((item) => isPlainObject(item) && item.id && item.id === val2.id)

        if (key !== -1 && key !== key2) {
          keyPath[keyPath.length - 1] = key
          return
        }
      }
    }

    const { destinationReached } = walkPath(def, keyPath)

    if (!destinationReached) {
      const meaningfulKey = keyPath2.at(isExprVal(obj2) ? -2 : -1)

      registerOfChanges.push(
        genAdditionChangeRecord(val2, "id", (def) => def?.name?.val ?? "", keyPath2, meaningfulKey)
      )

      return true
    }
  })
}

diffEntities(
  app,
  app2,
  {
    functions: { genDisplayValue: (item) => `[${item.type.val}] ${item.name?.val ?? ""}` },
    variables: { genDisplayValue: (item) => item.name?.val ?? "" },
    layouts: { genDisplayValue: (item) => `[${item.code}] ${item.name}`, idKeyPath: "definition.id" },
  },
  appChanges
)

diffDefs(appRest, app2Rest, appChanges.rest)
diffDefs(appDefRest, app2DefRest, appChanges.rest)
diffDefs(app.functions, app2.functions, appChanges.functions)
diffDefs(app.variables, app2.variables, appChanges.variables)

for (let i = 0; i < app.layouts.length; i++) {
  const {
    definition: { functions: layoutFunctions, variables: layoutVariables, layout, ...layoutDefRest },
    ...layoutRest
  } = app.layouts[i]

  const {
    definition: { functions: layout2Functions, variables: layout2Variables, layout: layout2, ...layout2DefRest },
    ...layout2Rest
  } = app2.layouts[i]

  let layoutDef = {
    functions: layoutFunctions,
    variables: layoutVariables,
    components: layout ? [layout] : [],
  }

  let layout2Def = {
    functions: layout2Functions,
    variables: layout2Variables,
    components: layout2 ? [layout2] : [],
  }

  let layoutChanges = {
    titles: [`${layoutRest.name} [${layoutRest.code}]`, `${layout2Rest.name} [${layout2Rest.code}]`],
    functions: [],
    variables: [],
    components: [],
    rest: [],
  }

  diffEntities(
    layoutDef,
    layout2Def,
    {
      functions: { genDisplayValue: (item) => `[${item.type.val}] ${item.name?.val ?? ""}` },
      variables: { genDisplayValue: (item) => item.name?.val ?? "" },
      components: { genDisplayValue: (item) => `[${item.component.val}] ${item.name?.val ?? ""}` },
    },
    layoutChanges
  )

  diffDefs(layoutRest, layout2Rest, layoutChanges.rest)
  diffDefs(layoutDefRest, layout2DefRest, layoutChanges.rest)
  diffDefs(layoutDef.functions, layout2Def.functions, layoutChanges.functions)
  diffDefs(layoutDef.variables, layout2Def.variables, layoutChanges.variables)

  if (layoutDef.components.length > 0 && layout2Def.components.length > 0) {
    const compChanges = (function recurseComponents(def, def2) {
      const { components, ...rest } = def
      const { components: components2, ...rest2 } = def2

      let compDef = {
        components,
      }

      let compDef2 = {
        components: components2,
      }

      let compChanges = {
        titles: [
          `[${rest.component.val}] ${rest.name?.val ?? ""}`,
          `[${rest2.component.val}] ${rest2.name?.val ?? ""}`,
        ],
        components: [],
        rest: [],
      }

      diffEntities(
        compDef,
        compDef2,
        {
          components: { genDisplayValue: (item) => `[${item.component.val}] ${item.name?.val ?? ""}` },
        },
        compChanges
      )

      diffDefs(rest, rest2, compChanges.rest)

      compChanges.components.push(
        ...compDef.components
          .map((childCompDef, i) => recurseComponents(childCompDef, compDef2.components[i]))
          .filter(areSomeChangesRegistered)
      )

      return compChanges
    })(layoutDef.components[0], layout2Def.components[0])

    if (areSomeChangesRegistered(compChanges)) {
      layoutChanges.components.push(compChanges)
    }
  }

  if (areSomeChangesRegistered(layoutChanges)) {
    appChanges.layouts.push(layoutChanges)
  }
}

let stats = Object.values(OPS).reduce((acc, { id }) => ({ ...acc, [id]: 0 }), {})

let lastObj
recurseObject(appChanges, (_key, _val, obj) => {
  if (Object.hasOwn(obj, "op")) {
    if (obj !== lastObj) {
      lastObj = obj
      stats[obj.op]++
    }

    return true
  }
})

const composeChangeHtml = (change) => {
  let header = ""
  let content = ""

  switch (change.op) {
    case OPS.add.id:
    case OPS.rm.id:
      header = `
        ${
          change.op === OPS.add.id
            ? "<span class='symbol symbol--plus'>+</span>"
            : "<span class='symbol symbol--minus'>-</span>"
        }

        <h3>${change.displayValue}</h3>
      `

      content = `
        <p class="path"><strong>Path:</strong> ${change.keyPath ? change.keyPath.join(".") : change.key}</p>

        ${
          isObject(change.def)
            ? `
                <code><pre>
                  ${JSON.stringify(change.def, undefined, 2)}
                </pre></code>
              `
            : `<div>${change.def}</div>`
        }
      `

      break

    case OPS.ro.id:
      header = `
        <span class='symbol symbol--other'><-></span>
        <h3>${change.displayValues[1] ?? ""}</h3>
      `

      content = `
        <p><strong>From:</strong> ${change.indices[0]}</p>
        <p><strong>To:</strong> ${change.indices[1]}</p>

        ${
          isObject(change.defs[1])
            ? `
              <code><pre>
                ${JSON.stringify(change.defs[1], undefined, 2)}
              </pre></code>
            `
            : `<div>${change.defs[1]}</div>`
        }
        `

        break

    case OPS.mod.id:
      header = `<span class='symbol symbol--other'>M</span>`
      content = `
        <p class="path"><strong>Path:</strong> ${change.keyPath.join(".")}</p>

        <p><strong>Previous:</strong>${!isObject(change.values[0]) ? ` ${change.values[0]}` : ""}</p>

          ${
            isObject(change.values[0])
              ? `
                  <code><pre>
                    ${JSON.stringify(change.values[0], undefined, 2)}
                  </pre></code>
                `
              : ``
          }
          
          <p><strong>Current:</strong>${!isObject(change.values[1]) ? ` ${change.values[1]}` : ""}</p>

          ${
            isObject(change.values[1])
              ? `
                  <code><pre>
                    ${JSON.stringify(change.values[1], undefined, 2)}
                  </pre></code>
                `
              : ``
          }
      `

      break
  }

  return `
    <div class="change">
        ${wrapToCollapsable(`<span class="collapsable-header">${header}</span>`, content)}
    </div>
  `
}

const mapChangesToHtml = (changes) => sortChanges(changes).map(composeChangeHtml).join("")

const wrapToCollapsable = (header, content) => {
  return `
    <span class="collapsable-trigger collapsable-trigger--expanded symbol" onclick="
      const trigger = event.target;
      const isExpanded = trigger.classList.contains('collapsable-trigger--expanded');

      trigger.classList[isExpanded ? 'remove' : 'add']('collapsable-trigger--expanded');
      trigger.classList[isExpanded ? 'add' : 'remove']('collapsable-trigger--collapsed');
    ">
      >
    </span>

    <span>
      ${header}
    </span>

    <div class="collapsable">
      ${content}
    </div>
  `
}

let html = `
  <style>
    ._changes_ {
      *:not(h1, h2, h3, h4) {
        font-size: 16px;
      }

      h1, h2, h3, h4 {
        margin: 0;
      }
    
      .stats-list {
        list-style: none;
      }

      .collapsable-trigger {
        display: inline-flex !important;
      }

      .collapsable-trigger + span {
        display: inline-flex;
        margin-left: 10px;
      }
      
      .collapsable-trigger--expanded {
        rotate: 90deg;
      }

      .collapsable-trigger--collapsed + span + .collapsable {
        height: 0px;
        overflow: hidden;
      }

      .collapsable-header {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .symbol {
        background-color: rgb(229.5,229.5,229.5);
        padding: 5px;
        font-size: 20px;
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .symbol--minus {
        color: rgb(255,0,0);
      }

      .symbol--plus {
        color: rgb(0,255,0);
      }

      .symbol--other {
        color: rgb(0,0,255);
      }

      .change {
        border-top: 1px solid rgb(0,0,0);
        margin-top: 10px;
        padding: 10px 0;
      }

      code pre {
        background-color: rgb(229.5,229.5,229.5);
        padding: 10px;
        text-wrap: wrap;
      }
    }
  </style>

  <div class="_changes_">
    <h1>Aplikace: ${appChanges.titles[1]}</h1>
  
    <div><strong>Changes:</strong> ${Object.values(stats).reduce((acc, val) => acc + val)}</div>
    <ul class="stats-list">
      ${Object.values(OPS)
        .filter(({ id }) => stats[id] > 0)
        .sort((a, b) => b.priority - a.priority)
        .map(({ id, name }) => `<li><strong>${name}s:</strong> ${stats[id]}</li>`)
        .join("")}
    </ul>

    ${mapChangesToHtml(appChanges.rest)}

    ${appChanges.functions.length > 0 ? "<h2>Funkce</h2>" : ""}
    ${mapChangesToHtml(appChanges.functions)}

    ${appChanges.variables.length > 0 ? "<h2>Proměnné</h2>" : ""}
    ${mapChangesToHtml(appChanges.variables)}

    ${appChanges.layouts.length > 0 ? "<h2>Obrazovky</h2>" : ""}
    ${mapChangesToHtml(appChanges.layouts.filter(({ titles }) => !titles))}
    ${appChanges.layouts
      .filter(({ titles }) => titles)
      .map((layoutChanges) => {
        return `
          ${wrapToCollapsable(
            `<h2>Obrazovka: ${layoutChanges.titles[1]}</h2>`,
            `
            ${mapChangesToHtml(layoutChanges.rest)}
        
            ${layoutChanges.functions.length > 0 ? "<h2>Funkce</h2>" : ""}
            ${mapChangesToHtml(layoutChanges.functions)}

            ${layoutChanges.variables.length > 0 ? "<h2>Proměnné</h2>" : ""}
            ${mapChangesToHtml(layoutChanges.variables)}

            ${layoutChanges.components.length > 0 ? "<h2>Komponenty</h2>" : ""}
            ${(function recurseComponents(comps) {
              return `
                ${mapChangesToHtml(comps.filter(({ titles }) => !titles))}
                ${comps
                  .filter(({ titles }) => titles)
                  .map(
                    (comp) => `
                      <h2>Komponenta: ${comp.titles[1]}</h2>
                      ${mapChangesToHtml(comp.rest)}
                      ${recurseComponents(comp.components)}`
                  )
                  .join("")}`
            })(layoutChanges.components)}
          `
          )}
      `
      })
      .join("")}
  </div>

`

return html
