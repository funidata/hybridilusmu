const actions = (elements) => {
  return(
    {
      type: "actions",
      elements: elements
    }
  )
}

module.exports = { actions }