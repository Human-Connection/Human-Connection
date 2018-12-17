## Basic usage

Display an array of data objects.
```
<template>
  <ds-table :data="tableData">
  </ds-table>
</template>

<script>
  export default {
    data() {
      return {
        tableData: [
          {
            name: 'Rengar',
            type: 'Jungler',
            loves: 'Hide and seek'
          },
          {
            name: 'Renekton',
            type: 'Toplaner',
            loves: 'Slice and dice'
          },
          {
            name: 'Twitch',
            type: 'ADC',
            loves: 'Spray and pray'
          },
          {
            name: 'Blitz',
            type: 'Support',
            loves: 'Hook you up'
          }
        ]
      }
    }
  }
</script>
```

## Specify fields

You can specify which fields to display
```
<template>
  <ds-table :data="tableData" :fields="tableFields">
  </ds-table>
</template>

<script>
  export default {
    data() {
      return {
        tableFields: ['name', 'type'],
        tableData: [
          {
            name: 'Rengar',
            type: 'Jungler',
            loves: 'Hide and seek'
          },
          {
            name: 'Renekton',
            type: 'Toplaner',
            loves: 'Slice and dice'
          },
          {
            name: 'Twitch',
            type: 'ADC',
            loves: 'Spray and pray'
          },
          {
            name: 'Blitz',
            type: 'Support',
            loves: 'Hook you up'
          }
        ]
      }
    }
  }
</script>
```

## Customize header

You can customize the header by setting fields as an object.

The value can be a string representing the fields label or an object with options.
```
<template>
  <ds-table :data="tableData" :fields="tableFields">
  </ds-table>
</template>

<script>
  export default {
    data() {
      return {
        tableFields: {
          name: 'Hero',
          type: {
            label: 'Job',
            width: '300px',
            align: 'right'
          }
        },
        tableData: [
          {
            name: 'Rengar',
            type: 'Jungler',
            loves: 'Hide and seek'
          },
          {
            name: 'Renekton',
            type: 'Toplaner',
            loves: 'Slice and dice'
          },
          {
            name: 'Twitch',
            type: 'ADC',
            loves: 'Spray and pray'
          },
          {
            name: 'Blitz',
            type: 'Support',
            loves: 'Hook you up'
          }
        ]
      }
    }
  }
</script>
```

## Custom columns

You can define custom templates for columns and create columns that do not have a corresponding data attribute.

Via scoped slots you have access to the columns `row`, `index` and `col`.
```
<template>
  <div>
    <ds-table :data="tableData" :fields="tableFields">
      <template slot="loves" slot-scope="scope">
        {{ scope.row.name }} loves {{ scope.row.loves }}
      </template>
      <template slot="edit" slot-scope="scope">
        <ds-button
          size="small"
          @click="deleteRow(scope.row)">delete</ds-button>
      </template>
    </ds-table>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        tableFields: ['name', 'type', 'loves', 'edit'],
        tableData: [
          {
            name: 'Rengar',
            type: 'Jungler',
            loves: 'Hide and seek'
          },
          {
            name: 'Renekton',
            type: 'Toplaner',
            loves: 'Slice and dice'
          },
          {
            name: 'Twitch',
            type: 'ADC',
            loves: 'Spray and pray'
          },
          {
            name: 'Blitz',
            type: 'Support',
            loves: 'Hook you up'
          }
        ]
      }
    },
    methods: {
      deleteRow(row) {
        const index = this.tableData.indexOf(row)
        if (index > -1) {
          this.tableData.splice(index, 1)
        }
      }
    }
  }
</script>
```
