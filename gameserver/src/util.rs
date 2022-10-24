use serde::{
    de::{self, Visitor},
    Deserialize, Deserializer, Serialize,
};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[ts(export, rename_all = "camelCase")]
pub struct Vec2 {
    pub x: f32,
    pub y: f32,
}

impl Vec2 {
    pub fn new(x: f32, y: f32) -> Self {
        Self { x, y }
    }
}

#[derive(Debug, Serialize, Clone, TS)]
#[ts(export, rename_all = "camelCase")]
pub struct IVec2 {
    pub x: i32,
    pub y: i32,
}

impl IVec2 {
    pub fn new(x: i32, y: i32) -> Self {
        Self { x, y }
    }
}

struct IVec2Visitor;

enum Vec2Field {
    X,
    Y,
}





impl<'de> Deserialize<'de> for IVec2 {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {

        impl<'de> Deserialize<'de> for Vec2Field {
            fn deserialize<D>(deserializer: D) -> Result<Vec2Field, D::Error>
            where
                D: Deserializer<'de>,
            {
                struct FieldVisitor;
        
                impl<'de> Visitor<'de> for FieldVisitor {
                    type Value = Vec2Field;
        
                    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                        formatter.write_str("`x` or `y`")
                    }
        
                    fn visit_str<E>(self, value: &str) -> Result<Vec2Field, E>
                    where
                        E: de::Error,
                    {
                        match value {
                            "x" => Ok(Vec2Field::X),
                            "y" => Ok(Vec2Field::Y),
                            _ => Err(de::Error::unknown_field(value, FIELDS)),
                        }
                    }
                }
        
                deserializer.deserialize_identifier(FieldVisitor)
            }
        
        }
        


        impl<'de> Visitor<'de> for IVec2Visitor {
            type Value = IVec2;
        
            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("`x` or `y`")
            }
        
            fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
            where
                A: de::MapAccess<'de>,
            {
                let mut x: Option<f32> = None;
                let mut y: Option<f32> = None;
        
                while let Some(key) = map.next_key()? {
                    match key {
                        Vec2Field::X => {
                            if x.is_some() {
                                return Err(de::Error::duplicate_field("x"));
                            }
                            x = Some(map.next_value()?);
                        }
                        Vec2Field::Y => {
                            if y.is_some() {
                                return Err(de::Error::duplicate_field("y"));
                            }
                            y = Some(map.next_value()?);
                        }
                    }
                }
        
                let x = x.ok_or_else(|| de::Error::missing_field("x"))?;
                let y = y.ok_or_else(|| de::Error::missing_field("y"))?;
        
                Ok(IVec2::new(x.round() as i32, y.round() as i32))
            }
        }

        const FIELDS: &[&str] = &["x", "y"];
        deserializer.deserialize_struct("IVec2", FIELDS, IVec2Visitor)
    }
}
